$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function ConvertFrom-SecureInput([Security.SecureString]$Value) {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Set-PostgresEnvironment([string]$ConnectionUrl, [string]$DefaultSslMode) {
  $uri = [Uri]$ConnectionUrl
  if ($uri.Scheme -notin @('postgres', 'postgresql')) {
    throw 'Connection URL must use postgres:// or postgresql://.'
  }
  $separator = $uri.UserInfo.IndexOf(':')
  if ($separator -lt 1) { throw 'Connection URL must include a database username and password.' }
  $env:PGUSER = [Uri]::UnescapeDataString($uri.UserInfo.Substring(0, $separator))
  $env:PGPASSWORD = [Uri]::UnescapeDataString($uri.UserInfo.Substring($separator + 1))
  $env:PGHOST = $uri.Host
  $env:PGPORT = if ($uri.Port -gt 0) { [string]$uri.Port } else { '5432' }
  $env:PGDATABASE = [Uri]::UnescapeDataString($uri.AbsolutePath.TrimStart('/'))
  $env:PGSSLMODE = $DefaultSslMode
  if ($uri.Query -match '(?:\?|&)sslmode=([^&]+)') {
    $env:PGSSLMODE = [Uri]::UnescapeDataString($Matches[1])
  }
  if (-not $env:PGDATABASE) { throw 'Connection URL is missing the database name.' }
}

function Get-PublicTableCounts([string]$PsqlPath) {
  $names = @(& $PsqlPath -X -v ON_ERROR_STOP=1 -A -t -c "SELECT quote_ident(table_name) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name")
  if ($LASTEXITCODE -ne 0) { throw 'Could not list public tables for reconciliation.' }
  $counts = @{}
  foreach ($table in $names) {
    if (-not $table) { continue }
    $countText = (& $PsqlPath -X -v ON_ERROR_STOP=1 -A -t -c "SELECT COUNT(*) FROM public.$table") -join ''
    if ($LASTEXITCODE -ne 0) { throw "Could not count table $table." }
    $counts[$table] = $countText.Trim()
  }
  return $counts
}

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
$pgRestore = Get-Command pg_restore -ErrorAction SilentlyContinue
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgDump -or -not $pgRestore -or -not $psql) {
  throw 'PostgreSQL 16 command-line tools (pg_dump, pg_restore, psql) must be installed and available on PATH.'
}

Write-Host ''
Write-Host 'ROYAL SKYE — COPY-ONLY PRODUCTION DATA MIGRATION' -ForegroundColor Cyan
Write-Host 'The source website database is read-only for this operation. Nothing is deleted there.'
Write-Host 'The destination must be a brand-new, empty local database.'
Write-Host ''

$sourceSecure = Read-Host 'Paste the Render EXTERNAL PostgreSQL URL (input hidden)' -AsSecureString
$targetSecure = Read-Host 'Paste the LOCAL PostgreSQL URL (input hidden)' -AsSecureString
$sourceUrl = ConvertFrom-SecureInput $sourceSecure
$targetUrl = ConvertFrom-SecureInput $targetSecure

$backupDir = Join-Path $PSScriptRoot '..\backups'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dumpPath = Join-Path (Resolve-Path $backupDir) "royal-skye-production-$stamp.dump"
$reportPath = Join-Path (Resolve-Path $backupDir) "royal-skye-migration-$stamp.txt"

try {
  Write-Host '1/5  Checking source database and creating a consistent PostgreSQL snapshot...' -ForegroundColor Yellow
  Set-PostgresEnvironment $sourceUrl 'require'
  & $psql.Source -X -v ON_ERROR_STOP=1 -A -t -c 'SELECT 1' | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not connect to the source database. Check the Render external URL and IP allowlist.' }
  & $pgDump.Source --format=custom --no-owner --no-acl --file $dumpPath
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $dumpPath)) { throw 'pg_dump failed; no local database was changed.' }
  & $pgRestore.Source --list $dumpPath | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'The downloaded PostgreSQL snapshot failed its archive integrity check.' }
  $hash = (Get-FileHash -Algorithm SHA256 $dumpPath).Hash
  $sourceCounts = Get-PublicTableCounts $psql.Source

  Write-Host '2/5  Verifying that the local destination is empty...' -ForegroundColor Yellow
  Set-PostgresEnvironment $targetUrl 'disable'
  $tableCountText = (& $psql.Source -X -v ON_ERROR_STOP=1 -A -t -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ''public'' AND table_type = ''BASE TABLE''') -join ''
  if ($LASTEXITCODE -ne 0) { throw 'Could not connect to the local destination database.' }
  $tableCount = [int]$tableCountText.Trim()
  if ($tableCount -ne 0) { throw "Destination is not empty ($tableCount public tables). No restore was attempted. Create a new empty database instead." }

  Write-Host '3/5  Restoring into the empty local database (single transaction; no source writes)...' -ForegroundColor Yellow
  & $pgRestore.Source --single-transaction --exit-on-error --no-owner --no-acl --dbname=$env:PGDATABASE $dumpPath
  if ($LASTEXITCODE -ne 0) { throw 'Restore failed. The destination transaction was rolled back; source data is unchanged.' }

  Write-Host '4/5  Reconciling source and restored table row counts...' -ForegroundColor Yellow
  $targetCounts = Get-PublicTableCounts $psql.Source
  $allTables = @($sourceCounts.Keys + $targetCounts.Keys | Sort-Object -Unique)
  $mismatches = @()
  $lines = @(
    'Royal Skye copy-only migration report',
    "Created: $(Get-Date -Format o)",
    "Dump SHA256: $hash",
    "Destination: $($env:PGHOST):$($env:PGPORT)/$($env:PGDATABASE)",
    '',
    'Table row counts (source snapshot check vs local restore):'
  )
  foreach ($table in $allTables) {
    $sourceCount = $sourceCounts[$table]
    $targetCount = $targetCounts[$table]
    $lines += "$table | source=$sourceCount | local=$targetCount"
    if ($sourceCount -ne $targetCount) { $mismatches += "$table (source=$sourceCount, local=$targetCount)" }
  }
  if ($mismatches.Count -gt 0) {
    $lines += ''
    $lines += 'RECONCILIATION FAILED. Source writes may have occurred during the snapshot. Do not cut over.'
    $lines | Set-Content -Encoding UTF8 $reportPath
    throw ("Row counts differ. Pause writes and repeat the snapshot. " + ($mismatches -join '; '))
  }
  $lines += ''
  $lines += 'RECONCILIATION PASSED: public table row counts match.'
  $lines | Set-Content -Encoding UTF8 $reportPath

  Write-Host '5/5  Migration snapshot restored and row counts reconciled.' -ForegroundColor Green
  Write-Host "Backup: $dumpPath"
  Write-Host "Report: $reportPath"
  Write-Host 'The source website database was never modified.'
}
finally {
  $env:PGPASSWORD = $null
  $sourceUrl = $null
  $targetUrl = $null
  $sourceSecure = $null
  $targetSecure = $null
}
