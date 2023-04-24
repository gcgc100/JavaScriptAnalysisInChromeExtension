#!/bin/bash

# When git log the time for certain tag, all commits are listed. We skip the first line and use the second line(The first line of time seems a noisy data).

BASEDIR=$(dirname "$BASH_SOURCE")

versionList=$(sqlite3 $BASEDIR/../../data2022/dataV1-2.db -cmd '.header off' 'select version from Library where libname="jquery" and version!="100" and version!="None"')

cd $BASEDIR/../../../jquery
for v in ${versionList[@]}; do
    echo $v | grep "^\d\+\.\d\+\.\d\+$"
    if [ $? -eq 0 ]; then
        cTime=$(git log -i --format=%ai $v 2>/dev/null| head -n 1)
        cTime=$(awk '{print $1}' <<EOF
$cTime
EOF
)
        echo ${cTime[0]}
        $(sqlite3 ../JavaScriptAnalysisInChromeExtension/data2022/dataV1-2.db 'update library set releaseTime="'${cTime[0]}'" where version="'$v'" and libname="jquery"')
    fi
done
