
.PHONY: run ../data/extSrc/extensionSource/* test temptest

run: ../data/extSrc/extensionSource/*

../data/extSrc/extensionSource/*:
	python analyser.py -a $@

saveExtensionIdToDB:
	python MysqlManager.py --idList ../data/extensionList.json

clean:
	rm -rf ../data/scripts
	rm -r ../data/sqliteDB.db

test:
	nosetests -s --pdb

temptest:
	ehco temptest

SampleDBUtil:
	rm -f ../../data/data.db
	cp ../../data/data1.db ../../data/data.db
	python3 temp/SampleDBUtil.py

