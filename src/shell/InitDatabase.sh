#!/bin/bash

shopt -s nullglob

BASEDIR=$(dirname "$BASH_SOURCE")
PYTHON=python3

echo $BASEDIR

#extensionIdList=$BASEDIR/../../data/extensionIdList/
extensionIdList=$BASEDIR/$GCEXTANA_EXTENSIONIDLIST
database=$BASEDIR/$GCEXTANA_DATABASE


if test -f $database; then
    exit
else
    tmpData=$BASEDIR/../../data/tmpData
    mkdir -p $tmpData
    $PYTHON $BASEDIR/../python/bin/ExtensionTool.py addExtensionId $database --extensionIdList $extensionIdList
fi
