#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import inspect

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from OrmDatabase import *

import mylogging
logger = mylogging.logger


dbpath = os.path.abspath("../../../tests/shellTests/test.db")

db.bind(provider='sqlite', filename=dbpath, create_db=True)
db.generate_mapping(create_tables=True)

with db_session:
    # aa = db.select("SELECT * FROM  javascriptinclusion where extension in (SELECT id from (SELECT id, extensionId, MAX(downloadTime) as dt FROM Extension GROUP BY ExtensionId))")
    aa = db.select("SELECT id from (SELECT id, extensionId, MAX(downloadTime) as dt FROM Extension GROUP BY ExtensionId)")
    tt = select(e for e in Extension if (e.extensionId, e.downloadTime) in ((e.extensionId, max(e.downloadTime)) for e in Extension))[:]
    print(tt)
    js = JavaScriptInclusion.select(extension = 18142)
    # js = JavaScriptInclusion.select(lambda c: c.extension in )
    __import__('pdb').set_trace()  # XXX BREAKPOINT
    pass

pass
