#!/usr/bin/env bash
set -e

SCRIPT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_PATH"

# Add SSH key
eval "$(ssh-agent -s)"
openssl aes-256-cbc -K $encrypted_444f81e1d0fd_key -iv $encrypted_444f81e1d0fd_iv -in id_rsa.enc -out id_rsa -d
chmod 600 id_rsa
ssh-add id_rsa

# Create public directory
cd ..
rm -rf public
mkdir public
ls
cp -r .git public

# Move to gh-pages branch and clean
cd public
git remote rm origin
git remote add origin git@github.com:pion/website.git
git fetch
git checkout gh-pages
git reset --hard origin/gh-pages
rm -rf *
git checkout CNAME

# Generate site
cd ..
CURRENT_COMMIT=$(git rev-parse HEAD)
hugo

# commit and push
cd public
git add .
git commit -m "Generate site from $CURRENT_COMMIT"
git push
