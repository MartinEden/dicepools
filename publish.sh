#!/usr/bin/env bash
set -ex

rm -r bundle
mkdir bundle
cd bundle

cp ../dice.js .
cp ../style.css .
cp ../license.txt .
cp ../gear.png .
echo "dice-pools.surge.sh" > CNAME

surge .
