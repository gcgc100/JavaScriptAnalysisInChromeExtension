.PHONY: run testShell clean cleanTest

run: 
	zsh src/shell/run.sh || exit 1

clean:
	rm -rf data/archive
	rm -rf data/crxFiles
	rm -rf data/data.db
	rm -rf data/scripts
	rm -rf data/extSrc
	rm -rf data/cacheData
	rm -rf data/tmpData

testShell:
	zsh src/shell/run.sh test || exit 1

cleanTest:
	rm -rf tests/shellTests/archive
	rm -rf tests/shellTests/crxFiles
	rm -rf tests/shellTests/test.db
	rm -rf tests/shellTests/scripts
	rm -rf tests/shellTests/extSrc
	rm -rf tests/shellTests/cacheData

#newVersionTest:
#    bash src/shell/downloadCrx.sh testNewVersion || exit 1
#    bash src/shell/unpackAllCrx.sh test || exit 1
#    bash src/shell/extractJSInc.sh test || exit 1 
#    bash src/shell/setLibVersion.sh test || exit 1
