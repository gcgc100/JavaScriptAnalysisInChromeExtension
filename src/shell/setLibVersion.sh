#!/bin/bash


BASEDIR=$(dirname "$BASH_SOURCE")

database=$BASEDIR/../../data/data.db

if [[ ! -z $1 ]]; then
    if [[ $1 = "test" ]]; then
        if [[ ! -f "$BASEDIR/../../tests/shellTests/test.db" ]]; then
            echo aa
        fi
        database=$BASEDIR/../../tests/shellTests/test.db
    fi
fi

python $BASEDIR/../python/bin/setVersion.py $database
