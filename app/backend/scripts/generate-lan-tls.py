#!/usr/bin/env python3
"""Create a private Royal Skye LAN CA and an IP-SAN HTTPS server certificate.

Run on the restaurant host PC. The CA private key never leaves that host.
Copy only royal-skye-local-ca.crt to the Android phone and install it as a CA
certificate. Re-running this script renews the server certificate using the
same CA, unless --new-ca is explicitly supplied.
"""
from __future__ import annotations

import argparse
import ipaddress
import socket
from datetime import datetime, timedelta
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import ExtendedKeyUsageOID, NameOID


def detect_lan_ip() -> ipaddress.IPv4Address:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # UDP connect selects the default route; it sends no application data.
        sock.connect(("192.0.2.1", 80))
        return ipaddress.ip_address(sock.getsockname()[0])
    finally:
        sock.close()


def write_private_key(path: Path, key: rsa.RSAPrivateKey) -> None:
    path.write_bytes(key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ))
    try:
        path.chmod(0o600)
    except OSError:
        pass


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ip", help="Restaurant host LAN IPv4 address")
    parser.add_argument("--new-ca", action="store_true", help="Rotate the private CA (requires reinstalling its certificate on phones)")
    args = parser.parse_args()

    host_ip = ipaddress.ip_address(args.ip) if args.ip else detect_lan_ip()
    if not isinstance(host_ip, ipaddress.IPv4Address) or host_ip.is_loopback or host_ip.is_link_local:
        raise SystemExit("Use the restaurant PC's private LAN IPv4 address.")

    cert_dir = Path(__file__).resolve().parents[1] / "certs"
    cert_dir.mkdir(parents=True, exist_ok=True)
    ca_key_path = cert_dir / "royal-skye-local-ca.key"
    ca_cert_path = cert_dir / "royal-skye-local-ca.crt"
    server_key_path = cert_dir / "server.key"
    server_cert_path = cert_dir / "server.crt"

    if args.new_ca or not (ca_key_path.exists() and ca_cert_path.exists()):
        ca_key = rsa.generate_private_key(public_exponent=65537, key_size=3072)
        now = datetime.utcnow()
        ca_name = x509.Name([
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Royal Skye Restaurant"),
            x509.NameAttribute(NameOID.COMMON_NAME, "Royal Skye Private LAN Root CA"),
        ])
        ca_cert = (
            x509.CertificateBuilder()
            .subject_name(ca_name)
            .issuer_name(ca_name)
            .public_key(ca_key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(now - timedelta(minutes=5))
            .not_valid_after(now + timedelta(days=3650))
            .add_extension(x509.BasicConstraints(ca=True, path_length=0), critical=True)
            .add_extension(x509.KeyUsage(
                digital_signature=True, content_commitment=False, key_encipherment=False,
                data_encipherment=False, key_agreement=False, key_cert_sign=True,
                crl_sign=True, encipher_only=False, decipher_only=False,
            ), critical=True)
            .sign(ca_key, hashes.SHA256())
        )
        write_private_key(ca_key_path, ca_key)
        ca_cert_path.write_bytes(ca_cert.public_bytes(serialization.Encoding.PEM))
    else:
        ca_key = serialization.load_pem_private_key(ca_key_path.read_bytes(), password=None)
        ca_cert = x509.load_pem_x509_certificate(ca_cert_path.read_bytes())

    server_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    now = datetime.utcnow()
    server_name = x509.Name([
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Royal Skye Restaurant"),
        x509.NameAttribute(NameOID.COMMON_NAME, str(host_ip)),
    ])
    san = x509.SubjectAlternativeName([
        x509.IPAddress(host_ip),
        x509.IPAddress(ipaddress.ip_address("127.0.0.1")),
        x509.DNSName("localhost"),
    ])
    server_cert = (
        x509.CertificateBuilder()
        .subject_name(server_name)
        .issuer_name(ca_cert.subject)
        .public_key(server_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - timedelta(minutes=5))
        .not_valid_after(now + timedelta(days=397))
        .add_extension(san, critical=False)
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
        .add_extension(x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]), critical=False)
        .add_extension(x509.KeyUsage(
            digital_signature=True, content_commitment=False, key_encipherment=True,
            data_encipherment=False, key_agreement=False, key_cert_sign=False,
            crl_sign=False, encipher_only=False, decipher_only=False,
        ), critical=True)
        .sign(ca_key, hashes.SHA256())
    )
    write_private_key(server_key_path, server_key)
    server_cert_path.write_bytes(server_cert.public_bytes(serialization.Encoding.PEM))

    print(f"HTTPS server URL: https://{host_ip}:8443")
    print(f"Android CA certificate: {ca_cert_path}")
    print("Copy only the .crt file to the Android phone and install it as a CA certificate.")
    print("Keep both .key files private. Never upload them to GitHub or send them in chat.")


if __name__ == "__main__":
    main()
