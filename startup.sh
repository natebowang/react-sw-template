#!/bin/bash
# Example: `bash react-sw-template/startup.sh yourTitle`

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
TITLE=$1
if [[ -z $TITLE ]]; then
  echo 'startup.sh need a TITLE parameter'
  exit 1
fi

# Copy files to title dir
rsync -aPi \
      --exclude 'startup.sh' \
      --exclude '.git' \
      --exclude '.idea' \
      --exclude '*.iml' \
      $SCRIPTPATH/ $TITLE/

# Update Project name
sed -i "s/%TITLE%/$TITLE/g" $TITLE/package.json
sed -i "s/%TITLE%/$TITLE/g" $TITLE/srcStatic/index.html

# Install dependencies and initial git repo
cd $TITLE
npm install
git init