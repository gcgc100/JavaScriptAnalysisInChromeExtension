
.PHONY: test


clean:
	rm -rf ../data/scripts
	rm -r ../data/sqliteDB.db

test:
	nosetests -s --pdb

SampleDBUtil:
	rm -f ../../data/dataV1.db
	cp ../../data/data1.db ../../data/dataV1.db
	python3 temp/SampleDBUtil.py

