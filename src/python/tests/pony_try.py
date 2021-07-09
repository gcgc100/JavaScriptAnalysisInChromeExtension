#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import inspect
import shutil
import inspect
import unittest

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from OrmDatabase import *

connected = False

class TestPony(unittest.TestCase):

    """Test case docstring."""

    def setUp(self):
        # dbpath = os.path.join(current_dir, "pony_try.db")
        global connected
        if not connected:
            dbpath = os.path.abspath("tests/pony_try.db")
            print(dbpath)
            db.bind(provider='sqlite', filename=dbpath, create_db=True)
            db.generate_mapping(create_tables=True)
            connected = True
        

    def tearDown(self):
        dbpath = os.path.abspath("tests/pony_try.db")
        print(dbpath)
        # os.remove(dbpath)

    def test_other(self):
        pass

    def test_select(self):
        with db_session:
            lib = Library.select(lambda x: x.id > 10)[:]
            print(lib)
            pass


# db = Database()
# dbpath = os.path.join(current_dir, "pony_try1.db")
# db.bind(provider='sqlite', filename=dbpath, create_db=True)
# db.generate_mapping(create_tables=True)

# with db_session:
#     lib = Library.select(lambda x: x.id > 10)[:]
#     exts = Extension.select()[:]
#     print(len(lib))

