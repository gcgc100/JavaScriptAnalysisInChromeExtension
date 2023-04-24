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

echo "\x1b[33;21mCheck the ChromeDriver and make sure it matches the Chrome version. ChromeDriver download url:https://chromedriver.chromium.org/downloads\x1b[0m"

echo "\x1b[33;21mMake sure the NAS server will be kept connected. All the data will be saved to NAS server. Input C to continue\x1b[0m"
read -k 

if [[ $REPLY = "C" ]]; then
    echo ""
    zsh src/shell/InitDatabase.sh || exit 1
    zsh src/shell/downloadCrx.sh || exit 1
    zsh src/shell/unpackAllCrx.sh || exit 1
    zsh src/shell/analyse.sh || exit 1
else
    echo "\nExit"
fi



