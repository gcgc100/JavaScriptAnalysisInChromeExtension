#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import shutil
import inspect
import unittest

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from ExtensionUtils import *

class TestExtensionUtils(unittest.TestCase):

    """Test case docstring."""

    def setUp(self):
        self.dbpath = "tests/tempdb/testExtUtils.db"
        try:
            dbpath = os.path.abspath(self.dbpath)
            db.bind(provider='sqlite', filename=dbpath, create_db=True)
            db.generate_mapping(create_tables=True)
        except BindingError as e:
            if e.args[0] != "Database object was already bound to SQLite provider":
                raise e

    def tearDown(self):
        os.remove(self.dbpath)

    def test_init_database(self):
        init_database("tests/HighScoreAndUsernum_1000.json")
        with db_session:
            exts = Extension.select()[:]
        self.assertEqual(len(exts), 1000)
        self.assertEqual(exts[2].extensionId, "kjfohgalkgmdidfnknoebbdihpapafko")
