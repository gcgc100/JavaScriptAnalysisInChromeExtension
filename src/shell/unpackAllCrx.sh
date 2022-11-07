#!/bin/zsh

# Unpack all the crx files in extCrxFiles/ to data/extSrcFinal

cat << EOF
Unpack extension and save the source code to ../data/extSrc.
The extension which is failed to unpack will be listed in UnpackCrxError.log

EOF

BASEDIR=$(dirname "$0")

if [[ $GCEXTANA_DATADIR == "/"* ]]; then
    DATADIR=""
else
    DATADIR=$BASEDIR/
fi

if [[ $GCEXTANA_EXTSRC == "/"* ]]; then
    extSrcDir=$GCEXTANA_EXTSRC
else
    extSrcDir=$DATADIR$GCEXTANA_EXTSRC
fi


if [[ $GCEXTANA_DATABASE == "/"* ]]; then
    database=$GCEXTANA_DATABASE
else
    database=$DATADIR$GCEXTANA_DATABASE
fi



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

#rm -rf /tmp/.org.chromium.Chromium.*
echo "Start to unpack extensions"
$PYTHON $BASEDIR/../python/bin/ExtensionTool.py unpackAllInDB ${database} --extSrcDir $extSrcDir

