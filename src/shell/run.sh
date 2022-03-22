#!/bin/zsh

if [[ -n $1 ]]; then
    if [[ $1 = "test" ]]; then
        source src/shell/testConfig.sh
    else
        "Invalid argument"
    fi
else
    source src/shell/config.sh
fi

echo "Make sure the NAS server will be kept connected. All the data will be saved to NAS server. Input c to continue"
read -k 

if [[ $REPLY = "C" ]]; then
    zsh src/shell/InitDatabase.sh || exit 1
    zsh src/shell/downloadCrx.sh || exit 1
    zsh src/shell/unpackAllCrx.sh || exit 1
    zsh src/shell/extractJSInc.sh || exit 1
    zsh src/shell/setLibVersion.sh || exit 1
else
    echo "\nExit"
fi



