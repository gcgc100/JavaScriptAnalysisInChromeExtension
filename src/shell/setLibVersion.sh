#!/bin/zsh


PYTHON=python3

BASEDIR=$(dirname "$0")
if [[ $GCEXTANA_DATADIR == "/"* ]]; then
    DATADIR=""
else
    DATADIR=$BASEDIR/
fi

database=$DATADIR$GCEXTANA_DATABASE

#dataDir=$BASEDIR/../../data/
#database=$BASEDIR/../../data/data.db
#if [[ ! -z $1 ]]; then
#    if [[ $1 = "test" ]]; then
#        dataDir=$BASEDIR/../../tests/shellTests/
#        database=${dataDir}test.db
#        if [[ ! -f "${dataDir}test.db" ]]; then
#            cp ${dataDir}extsrcTestData/test.db $database
#        fi

#        if [[ ! -d  "${dataDir}extSrc/" ]]; then
#            cp -R ${dataDir}extsrcTestData/extSrc/ ${dataDir}extSrc/
#        fi
#        scriptDir=${dataDir}scripts/
#        if [[ ! -d "$scriptDir" ]]; then
#            cp -R ${dataDir}extsrcTestData/scripts $scriptDir
#        fi
#        if [[ ! -d  "${dataDir}crxFiles/" ]]; then
#            cp -R ${dataDir}crxTestData/crxFiles/ ${dataDir}crxFiles/
#        fi
#    else
#        source $1
#        exit
#    fi
#fi

$PYTHON $BASEDIR/../python/bin/setVersion.py $database
