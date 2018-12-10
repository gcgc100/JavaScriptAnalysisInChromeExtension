.PHONY: cleanTest

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

testShell:
	bash src/shell/downloadCrx.sh test
	bash src/shell/unpackAllCrx.sh test
	bash src/shell/extractJSInc.sh test
	bash src/shell/setLibVersion.sh test

cleanTest:
	rm -rf tests/shellTests/archive
	rm -rf tests/shellTests/crxFiles
	rm -rf tests/shellTests/test.db
	rm -rf tests/shellTests/scripts
	rm -rf tests/shellTests/extSrc


