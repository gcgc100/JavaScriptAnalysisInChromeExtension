#!/bin/bash

shopt -s nullglob

BASEDIR=$(dirname "$BASH_SOURCE")

downloadCrx() {
    if [[ ! -n $1 || ! -n $2 || ! -n $3 || ! -n $4 ]]; then
        cat << EOF
    Download extension crx file from http://chrome-extension-downloader.com and save to ../../data/crxFiles

    Must provide two papameters,\nThe first one is ,\nThe second is 
    $$1: json file with id list array
    $$2: the category of the extension
    $$3: output dir where the crx files is saved to
    $$4: the sqlite database. All the ids will be saved into database
EOF
        #echo -e "Must provide two papameters,\nThe first one is json file with id list array,\nThe second is the category of the extension"
        exit 1
    fi
    outputDir=$3
    dbDir=$4
    tmpData=$BASEDIR/../../data/tmpData
    mkdir -p $tmpData
    cp -f $1 $tmpData/idList.json

    TMPFILE="$(mktemp -t --suffix=.SUFFIX downloadCrx_sh.XXXXXX)"
    trap "rm -f '$TMPFILE'" 0               # EXIT
    trap "rm -f '$TMPFILE'; exit 1" 2       # INT
    trap "rm -f '$TMPFILE'; exit 1" 1 15    # HUP TERM

    mkdir -p ${outputDir}$2
    ex_id=$(cat "$1" | python -c "import json, sys; print json.load(sys.stdin)[0]") || exit 1
    while [[ ! -z $ex_id ]]; do
        echo $ex_id
        wget --output-document=$ex_id.crx "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=49.0&x=id%3D"$ex_id"%26installsource%3Dondemand%26uc"
        if [ $? != 0 ]; then
            echo "Download $ex_id failed"
            echo $ex_id >> $2DownloadError
            rm -f $ex_id.crx
        else
            mv $ex_id.crx ${outputDir}$2
        fi

        cat "$1" | python -c "import json, sys; data=json.load(sys.stdin); s=json.dumps(data[1:]) if len(data)>0 else \"[]\"; print s;" | tee $TMPFILE 1>/dev/null
        mv -f $TMPFILE "$1"
        ex_id=$(cat "$1" | python -c "import json, sys; data=json.load(sys.stdin); ex_id=data[0] if len(data)>0 else ''; print ex_id;") || exit 1
    done
    python $BASEDIR/../python/bin/AddExtensionId.py $dbDir $tmpData/idList.json $2
    rm -f $tmpData/idList.json
    mkdir -p ${outputDir}ErrorCrx/
    if [[ -f $2DownloadError ]]; then
        mv $2DownloadError ${outputDir}ErrorCrx/
    fi
    zip -r ${outputDir}$2.zip ${outputDir}$2
}

allJsonFiles=("accessibility.json"
"blogging.json"
"communication.json"
"extensionList.json"
"fun.json"
"news.json"
"photos.json"
"productivity.json"
"searchTool.json"
"shopping.json"
"sports.json"
"webDevelopment.json")
extensionIdList=$BASEDIR/../../data/extensionIdList/
crxDir=$BASEDIR/../../data/crxFiles/
database=$BASEDIR/../../data/data.db
archive=$BASEDIR/../../data/archive/

if [[ ! -z $1 ]]; then
    if [[ $1 = "test" ]]; then
        allJsonFiles=("list1.json"
        "list2.json")
        extensionIdList=$BASEDIR/../../tests/shellTests/exIdList/
        crxDir=$BASEDIR/../../tests/shellTests/crxFiles/
        database=$BASEDIR/../../tests/shellTests/test.db
        archive=$BASEDIR/../../tests/shellTests/archive/
    else
        source $1
    fi
fi

mkdir -p ${archive}crx/
for i in ${extensionIdList}*; do
    tmpData=$BASEDIR/../../data/tmpData
    mkdir -p $tmpData
    cp -f $i $tmpData/tempidList.json
    i=`basename $i`
    echo $i
    downloadCrx $tmpData/tempidList.json ${i//.json/} $crxDir $database
    rm -f $tmpData/tempidList.json
    mv ${crxDir}*.zip ${archive}crx/
done
