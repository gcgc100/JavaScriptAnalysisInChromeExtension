#!/usr/bin/env python
# -*- coding: utf-8 -*-


# This program is used to fix the version in sqlite database.
# The version is reported by the library. Sometimes it will include some extra information.
# e.g. When the jquery is built, which feature is enabled.
#       3.1.0 -ajax,-ajax/jsonp,-ajax/load,-ajax/parseXML
# This program remove the last part and keep the version part,
# If the version cannot be extract, will ask user to set it.

from gClifford import sqliteDB as db
import re

db.create_engine("../../data/data.db")
libList = db.select("select * from LibraryTable")

skipLib = []
for lib in libList:
    version = lib["version"]
    if version == "None" or version == "100":
        continue
    if re.match("^\d+\.\d+(\.\d+)?$", version): 
        pass
    else:
        r = re.match("^(\d+\.\d+\.\d+).*", version)
        if r:
            version = r.group(1)
            db.update("update LibraryTable set version=? where id=?", version, lib["id"])
        else:
            if lib["version"] in skipLib:
                continue
            print lib
            version = raw_input("Input new version name, if 'skip', this version will be ignored in the future")
            if version == "skip":
                skipLib.append(lib["version"])
                continue
            db.update("update LibraryTable set version=? where id=?", version, lib["id"])


