#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import inspect
import unittest
import json

from unittest import mock
from unittest.mock import MagicMock
from unittest.mock import patch

# from OrmDatabase import *

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from OrmDatabase import *

class TestOrmDB(unittest.TestCase):

    """Test case docstring."""

    def setUp(self):
        dbpath = os.path.abspath(os.path.join(current_dir, "test.db"))
        self.db = define_database_and_entities(provider='sqlite', filename=dbpath, create_db=True)
        self.populate_database(self.db)

    def tearDown(self):
        self.db.drop_all_tables(with_all_data=True)

    @db_session
    def populate_database(self, db):
        extension1 = db.Extension(extensionId="001")
        extension2 = db.Extension(extensionId="002")
        extension3 = db.Extension(extensionId="003")

    def test_temp(self):
        with db_session:
            exts = self.db.Extension.select()[:]
            assert(len(exts) == 3)
            print(exts[0].id)


