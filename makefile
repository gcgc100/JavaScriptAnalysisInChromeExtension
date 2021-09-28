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
	zsh src/shell/cleanTest.sh || exit 1

#newVersionTest:
#    bash src/shell/downloadCrx.sh testNewVersion || exit 1
#    bash src/shell/unpackAllCrx.sh test || exit 1
#    bash src/shell/extractJSInc.sh test || exit 1 
#    bash src/shell/setLibVersion.sh test || exit 1
