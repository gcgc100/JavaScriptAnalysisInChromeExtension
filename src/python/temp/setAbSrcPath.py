#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import re

from gClifford import sqliteDB as db


db.create_engine("../../data/data.db")

data = db.select("select * from JavaScriptInHtmlTable")
data = filter(lambda x: x.get("src", "")!= "", data)

for d in data[0:]:
    if not d["src"].startswith("/"):
        # print(d["htmlPath"])
        # print(d["src"])
        if not re.match(r"[a-z]*://.*", d["src"]):
            htmlPath = re.sub(r"../data/extSrc/[a-zA-Z]*/[a-z]*/0_0_0", "", d["htmlPath"])
            baseDir = os.path.dirname(htmlPath)
            abSrc = os.path.join(baseDir, d["src"])
            abSrc = os.path.abspath(abSrc)
            print(abSrc)
            db.updateNoCommit("update JavaScriptInHtmlTable set abSrc=? where id=?", abSrc, d["id"])
            continue
    db.updateNoCommit("update JavaScriptInHtmlTable set abSrc=? where id=?", d["src"], d["id"])

# print releaseDateArray
# for lib in releaseDateArray:
#      db.updateNoCommit("update libraryInfoTable set createTime=? where libname='jquery' and version=?", lib['date'], lib["version"])

db._db_ctx.connection.commit()
