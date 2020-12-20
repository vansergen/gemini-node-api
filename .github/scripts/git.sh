#!/bin/bash
set -e

# Set pgp siging key
git config user.signingkey ${PGP_KEY_ID}

# Set the custom gpg program (that passes the passphrase to `gpg`)
git config gpg.program ./.github/scripts/gpg.sh

# Sign commits with PGP key
git config commit.gpgsign true
