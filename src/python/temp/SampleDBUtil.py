#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import inspect
import json

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from OrmDatabase import *

dbpath = os.path.join(parent_dir, "../../data/data.db")
db.bind(provider='sqlite', filename=dbpath, create_db=True)
db.generate_mapping(create_tables=True)


set_sql_debug(True)
with open(os.path.join(parent_dir, "../../../../chromeextensionjsanalysis/src/data/SampleExt10.json")) as f:
    ext10 = json.loads(f.read())

exts = []
files = []

with db_session:
    for eid in ext10:
        es = db.select("select * from extensionTable where extensionId == '" + eid + "'")
        exts += es


# __import__('pdb').set_trace()  # XXX BREAKPOINT

# db.disconnect()
# db.provider = db.schema = None
# db.bind(provider='sqlite', filename="temp.db", create_db=True)
# db.generate_mapping(create_tables=True)

# __import__('pdb').set_trace()  # XXX BREAKPOINT

# SCRIPT_BACKGROUND = 2
# SCRIPT_CONTENTSCRIPT = 0
# SCRIPT_WEBPAGE_SCRIPT = 1

with db_session:
    ls = db.select("select * from libraryInfoTable")
    for l in ls:
        lib = Library(id = l[0],
                version = l[2], 
                libname = l[1])

with db_session:
    ps = db.select("select distinct permission from PermissionTable")
    for p in ps:
        # print(p)
        if p != "":
            # some string with space at head or tail will be treated as same data
            # e.q.  'http://*/' and 'http://*/  '
            pp = ExtensionPermission.get(permission = p)
            if pp is None:
                extP = ExtensionPermission(permission = p)
    pass
# sys.exit()

with db_session:
    for e in exts:
        extension = Extension(category=e[0], 
                updateTime=datetime.datetime.strptime(e[1], "%Y-%m-%d").date(),
                extensionId=e[2],
                id=e[3],
                ratedScore=e[4],
                version=e[5],
                size=e[6],
                language=e[7],
                numUserRated=e[8],
                userNum=e[9])
        ps = db.select("select * from PermissionTable where extensionId = '" + e[2] + "'")
        for p in ps:
            print(p[2])
            extP = ExtensionPermission.get(permission=p[2])
            extension.permissions.add(extP)
            extP.extensions.add(extension)
        fs = db.select("select * from fileTable where extensionId = '" + e[2] + "'")
        assert(len(fs)>0)
        for f in fs:
            if f[5] is None:
                hash = " "
            else:
                hash = f[5]
            if f[1] == 2:
                jsInc = BackgroundScript(id=f[3],
                        extension = extension,
                        filepath=f[2],
                        hash=hash)
            elif f[1] == 0:
                jsInc = ContentScript(id=f[3],
                        extension = extension,
                        filepath=f[2],
                        matches = "placeholder",
                        hash=hash)
            elif f[1] == 1:
                addData = db.select("select * from JavaScriptInHtmlTable where fileId = " + str(f[3]))
                # print(f)
                # print(addData)
                assert(len(addData) > 0)
                if addData[0][3] == 'D':
                    m = DetectMethod.Dynamic.value
                else:
                    m = DetectMethod.Static.value
                jsInc = ExtensionWebpageScript(id=f[3],
                        extension = extension,
                        filepath=f[2],
                        hash=hash,
                        htmlPath=addData[0][1],
                        detectMethod=m,
                        url=addData[0][0])
            ls = db.select("select * from LibraryTable where fileId = " + str(f[3]))
            for l in ls:
                lib = Library.get(id = l[4])
                lib.scripts.add(jsInc)
                jsInc.libraries.add(lib)
                        

db.drop_table("ExtensionTable", if_exists=True, with_all_data=True)
db.drop_table("ContentScriptTable", if_exists=True, with_all_data=True)
db.drop_table("JavaScriptInHtmlTable", if_exists=True, with_all_data=True)
db.drop_table("PermissionTable", if_exists=True, with_all_data=True)
db.drop_table("FileTable", if_exists=True, with_all_data=True)
db.drop_table("SampleExtensionIdTable", if_exists=True, with_all_data=True)
db.drop_table("JavaScriptIncViaContentScriptTable", if_exists=True, with_all_data=True)
db.drop_table("libraryInfoTable", if_exists=True, with_all_data=True)
db.drop_table("LibraryTable", if_exists=True, with_all_data=True)
db.drop_table("efTable", if_exists=True, with_all_data=True)
db.drop_table("eflTable", if_exists=True, with_all_data=True)
db.drop_table("multiLibInclusion", if_exists=True, with_all_data=True)
