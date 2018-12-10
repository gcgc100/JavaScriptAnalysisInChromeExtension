#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import random
import shutil

from gClifford import sqliteDB as db

db.create_engine("../../data/data.db")

idArray = db.select("select extensionid, category from extensiontable")
print len(idArray)

sampleIdArray = random.sample([[d["extensionId"], d["category"]] for d in idArray], 3)
print len(sampleIdArray)

skipNum = 0

for sId in sampleIdArray:
    srcRoot = "../../data"
    sourceSrc = os.path.join(srcRoot, "extSrc", sId[1], sId[0])
    crxSrc = os.path.join(srcRoot, "crxFiles", sId[1], "%s.crx" % sId[0])
    if not os.path.isdir(sourceSrc):
        skipNum += 1
        continue
    desRoot = "../../../extensionMessage"
    sourceDes = os.path.join(desRoot, "sourceFiles/", sId[0])
    if os.path.isdir(sourceDes):
        skipNum += 1
        continue
    crxDes = os.path.join(desRoot, "crxFiles/")
    shutil.copytree(sourceSrc, sourceDes)
    shutil.copy(crxSrc, crxDes)

print skipNum
