#!/bin/bash

allVersion=(
"0.5.1"
"0.5.3"
"0.9.0"
"0.9.1"
"0.9.10"
"0.9.2"
"0.9.9"
"1.0.0"
"1.1.0"
"1.1.2"
"1.2.0"
"1.2.1"
"1.2.3"
"1.3.3"
)


mkdir -p jquery

for version in ${allVersion[@]}; do
    npm i backbone@$version
    npm audit > jquery/$version
    npm uninstall backbone
done

for version in ${allVersion[@]}; do
    grep "0 vulnerabilities" jquery/${version} > /dev/null
    t=$?
    #echo $t
    touch vulVersionList.txt
    if [[ $t -ne 0 ]]; then
        echo $version >> vulVersionList.txt
    fi
done
