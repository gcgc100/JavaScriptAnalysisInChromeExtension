.PHONY: cleanTest

run: data/cacheData
	bash src/shell/downloadCrx.sh
	bash src/shell/unpackAllCrx.sh
	bash src/shell/extractJSInc.sh
	bash src/shell/setLibVersion.sh

data/cacheData:
	cp -R data/extensionIdList data/cacheData


clean:
	rm -rf data/archive
	rm -rf data/crxFiles
	rm -rf data/data.db
	rm -rf data/scripts
	rm -rf data/extSrc
	rm -rf data/cacheData
	rm -rf data/tmpData

testShell:
	bash src/shell/downloadCrx.sh test
	bash src/shell/unpackAllCrx.sh test
	bash src/shell/extractJSInc.sh test
	bash src/shell/setLibVersion.sh test

tests/shellTests/cacheData:
	cp -R tests/shellTests/exIdList/ tests/shellTests/cacheData

cleanTest:
	rm -rf tests/shellTests/archive
	rm -rf tests/shellTests/crxFiles
	rm -rf tests/shellTests/test.db
	rm -rf tests/shellTests/scripts
	rm -rf tests/shellTests/extSrc
	rm -rf tests/shellTests/cacheData
