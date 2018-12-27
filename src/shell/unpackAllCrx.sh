#!/bin/bash

# Unpack all the crx files in extCrxFiles/ to data/extSrcFinal

cat << EOF
Unpack extension and save the source code to ../data/extSrcFinal.
The extension which is failed to unpack will be listed in data/UnpackCrxError.log

Requirement: make sure in /tmp, there is no directory named .org.chromium.Chromium.*
EOF

shopt -s nullglob

BASEDIR=$(dirname "$BASH_SOURCE")

crxDir=$BASEDIR/../../data/crxFiles/
extSrcDir=$BASEDIR/../../data/extSrc/

#if [[ ! -z $1 && $1=="test" ]]; then
#    crxDir=./tests/crxTestData/crxFiles/
#    extSrcDir=./tests/extSrc/
#fi

if [[ ! -z $1 ]]; then
    if [[ $1 = "test" ]]; then
        if [[ ! -d "$BASEDIR/../../tests/shellTests/crxFiles/" ]]; then
            cp -R $BASEDIR/../../tests/shellTests/crxTestData/crxFiles/ $BASEDIR/../../tests/shellTests/crxFiles
        fi
        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
        extSrcDir=$BASEDIR/../../tests/shellTests/extSrc/
    else
        source $1
    fi
fi

echo "Start to unpack extensions"
for crx in ${crxDir}*; do
    echo "Unpacking extension:$crx"
    eid=$(basename $crx)
    outputdir=${extSrcDir}
    mkdir -p $outputdir

    python $BASEDIR/../python/bin/unpackExtension.py "$crx" --output $outputdir
    isfail=$?
    if [ $isfail != 0 ]; then
        echo "$crx" >> data/UnpackCrxError.log
        if [[ "$isfail" -eq "2" ]]; then
            # if python code return 2, user want to stop unpacking and press ctrl-C
            break
        else
            rm -rf /tmp/.org.chromium.Chromium.*
            continue
        fi
    fi
done

#for cate in ${crxDir}*; do
#    category=$(basename $cate)
#    if [[ $category == "ErrorCrx" ]]; then
#        continue
#    fi
#    cat << EOF

#"Start to unpack category:$cate"

#EOF
#    for crx in $cate/*; do
#        echo "extension:$crx"
#        eid=$(basename $crx)
#        outputdir=${extSrcDir}${category}/
#        mkdir -p $outputdir

#        python $BASEDIR/../python/bin/unpackExtension.py "$crx" --output ${extSrcDir}${category}/
#        isfail=$?
#        if [ $isfail != 0 ]; then
#            echo "$crx" >> data/UnpackCrxError.log
#            if [[ "$isfail" -eq "2" ]]; then
#                # if python code return 2, user want to stop unpacking and press ctrl-C
#                break
#            else
#                rm -rf /tmp/.org.chromium.Chromium.*
#                continue
#            fi
#        fi
#    done
#done
