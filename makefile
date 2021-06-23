.PHONY: run testShell clean cleanTest

run: 
	bash src/shell/downloadCrx.sh
	bash src/shell/unpackAllCrx.sh
	bash src/shell/extractJSInc.sh
	bash src/shell/setLibVersion.sh

clean:
	rm -rf data/archive
	rm -rf data/crxFiles
	rm -rf data/data.db
	rm -rf data/scripts
	rm -rf data/extSrc
	rm -rf data/cacheData
	rm -rf data/tmpData

testShell:
	bash src/shell/downloadCrx.sh test || exit 1
	bash src/shell/unpackAllCrx.sh test || exit 1
	bash src/shell/extractJSInc.sh test || exit 1
	bash src/shell/setLibVersion.sh test || exit 1

cleanTest:
	rm -rf tests/shellTests/archive
	rm -rf tests/shellTests/crxFiles
	rm -rf tests/shellTests/test.db
	rm -rf tests/shellTests/scripts
	rm -rf tests/shellTests/extSrc
	rm -rf tests/shellTests/cacheData

testShell2:
	bash src/shell/downloadCrx.sh test2 || exit 1
	bash src/shell/unpackAllCrx.sh test2 || exit 1
	bash src/shell/extractJSInc.sh test2 || exit 1
	bash src/shell/setLibVersion.sh test2 || exit 1
