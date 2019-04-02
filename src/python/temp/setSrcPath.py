#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import inspect

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from OrmDatabase import *

dbpath = os.path.abspath("../../../tests/shellTests/test.db")
db.bind(provider='sqlite', filename=dbpath, create_db=True)
db.generate_mapping(create_tables=True)

with db_session:
    eList = select(e for e in Extension)
    for e in eList:
        srcPath = os.path.join(os.path.abspath("../../../tests/shellTests/extSrc/"), e.extensionId)
        e.srcPath = os.path.join(srcPath, os.listdir(srcPath)[0])
