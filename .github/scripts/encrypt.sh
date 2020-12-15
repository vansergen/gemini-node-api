#!/bin/bash
set -e

# Encrypt PGP key
gpg --batch --symmetric --cipher-algo AES256 \
  --output ./.github/pgp/key.asc.gpg --passphrase=${PRIVATE_KEY_PASSPHRASE} \
  ./.github/pgp/key.asc
