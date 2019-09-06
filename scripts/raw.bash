#!/bin/bash

cd ../2web2ui
git log --numstat --date=short -- '*.scss' > ~/src/projects/matchbox-okr/src/raw-data/raw.txt
echo "Sourced"
