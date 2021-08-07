#!/bin/bash

# Unpack all the crx files in extCrxFiles/ to data/extSrcFinal

cat << EOF
Unpack extension and save the source code to ../data/extSrc.
The extension which is failed to unpack will be listed in UnpackCrxError.log

EOF

shopt -s nullglob

BASEDIR=$(dirname "$BASH_SOURCE")
PYTHON=python3

extSrcDir=$BASEDIR/$GCEXTANA_EXTSRC
database=$BASEDIR/$GCEXTANA_DATABASE


#if [[ ! -z $1 ]]; then
#    if [[ $1 = "test" ]]; then
#        if [[ ! -d "$BASEDIR/../../tests/shellTests/crxFiles/" ]]; then
#            cp -R $BASEDIR/../../tests/shellTests/crxTestData/crxFiles/ $BASEDIR/../../tests/shellTests/crxFiles
#        fi
#        extSrcDir=$BASEDIR/../../tests/shellTests/extSrc/
#        database=$BASEDIR/../../tests/shellTests/test.db
#    else
#        source $1
#        exit
#    fi
#fi

rm -rf /tmp/.org.chromium.Chromium.*
echo "Start to unpack extensions"
$PYTHON $BASEDIR/../python/bin/ExtensionTool.py unpackAllInDB ${database} --extSrcDir $extSrcDir
