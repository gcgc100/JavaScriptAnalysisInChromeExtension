#!/bin/bash

if [[ !-z ]]; then
    if [[ $1 = "test" ]]; then
        source src/shell/testConfig.sh
    else
        "Invalid argument"
    fi
else
    source src/shell/config.sh
fi
bash src/shell/InitDatabase.sh || exit 1
bash src/shell/downloadCrx.sh || exit 1
bash src/shell/unpackAllCrx.sh || exit 1
bash src/shell/extractJSInc.sh || exit 1
bash src/shell/setLibVersion.sh || exit 1
