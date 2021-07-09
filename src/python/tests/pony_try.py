#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import inspect

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from OrmDatabase import *

dbpath = os.path.join(current_dir, "pony_try.db")
print(dbpath)
db.bind(provider='sqlite', filename=dbpath, create_db=True)
db.generate_mapping(create_tables=True)

with db_session:
    lib = Library.select(lambda x: x.id > 10)[:]
    __import__('pdb').set_trace()  # XXX BREAKPOINT
    pass
