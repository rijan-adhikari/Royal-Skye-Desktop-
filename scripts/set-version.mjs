import fs from "node:fs";

const version = process.argv[2];
if (!version || !/^\\d+\\.\\d+\\.\\d+$/.test(version)) {
  console.error("Usage: node scripts/set-version.mjs MAJOR.MINOR.PATCH (example: 1.2.0)");
  process.exit(1);
}

const files = [
  ["app/VERSION", (s) => version + "\\n# Android versionCode and versionName are generated from this file.\\n"],
  ["app/frontend/package.json", (s) => JSON.stringify({ ...JSON.parse(s), version }, null, 2) + "\\n"],
  ["app/frontend/src-tauri/tauri.conf.json", (s) => JSON.stringify({ ...JSON.parse(s), version }, null, 2) + "\\n"],
  ["app/frontend/src-tauri/Cargo.toml", (s) => s.replace(/^version = "\\d+\\.\\d+\\.\\d+"/m, `version = "${version}"`)],
];

for (const [path, transform] of files) {
  const original = fs.readFileSync(path, "utf8");
  const updated = transform(original);
  if (updated === original) throw new Error(`Version was not updated in ${path}`);
  fs.writeFileSync(path, updated);
  console.log(`Updated ${path} -> ${version}`);
}
console.log(`Commit these changes with a message containing: Release Royal Skye v${version}`);
