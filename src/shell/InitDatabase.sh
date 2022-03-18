#!/bin/zsh


BASEDIR=$(dirname "$0")
if [[ $GCEXTANA_DATADIR == "/"* ]]; then
    DATADIR=""
else
    DATADIR=$BASEDIR/
fi


extensionIdList=$DATADIR$GCEXTANA_EXTENSIONIDLIST
database=$DATADIR$GCEXTANA_DATABASE


if test -f $database; then
    exit
else
    tmpData=$BASEDIR/../../data/tmpData
    mkdir -p $tmpData
    $PYTHON $BASEDIR/../python/bin/ExtensionTool.py addExtensionId $database --extensionIdList $extensionIdList
fi
