#!/bin/bash

shopt -s nullglob

BASEDIR=$(dirname "$BASH_SOURCE")
PYTHON=python3

echo $BASEDIR

#extensionIdList=$BASEDIR/../../data/extensionIdList/
extensionIdList=$BASEDIR/../../data/extensionIdListSample10/
database=$BASEDIR/../../data/data.db

if [[ ! -z $1 ]]; then
    if [[ $1 = "test" ]]; then
        #extensionIdList=$BASEDIR/../../tests/shellTests/exIdListWithMulVulLib/
        extensionIdList=$BASEDIR/../../tests/shellTests/exIdList/
        database=$BASEDIR/../../tests/shellTests/test.db
    else
        source $1
        exit
    fi
fi

if test -f $database; then
    exit
else
    tmpData=$BASEDIR/../../data/tmpData
    mkdir -p $tmpData
    $PYTHON $BASEDIR/../python/bin/ExtensionTool.py addExtensionId $database --extensionIdList $extensionIdList
fi
