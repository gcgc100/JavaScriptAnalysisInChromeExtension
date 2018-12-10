#!/bin/bash

# When git log the time for certain tag, all commits are listed. We skip the first line and use the second line(The first line of time seems a noisy data).

BASEDIR=$(dirname "$BASH_SOURCE")

versionList=$(sqlite3 $BASEDIR/../../data/data.db -cmd '.header off' 'select version from libraryInfoTable where libname="jquery" and version!="100" and version!="None"')

cd $BASEDIR/../../../jquery
for v in ${versionList[@]}; do
    echo $v
    cTime=$(git log -i --format=%ai $v 2>/dev/null| head -n 2)
    cTime=$(awk '{print $1}' <<EOF
$cTime
EOF
)
    cTime=($cTime)
    echo ${cTime[@]}
    sqlite3 ../exincluanalysis/data/data.db 'update libraryInfoTable set createTime="'${cTime[1]}'" where version="'$v'" and libname="jquery"'
done
