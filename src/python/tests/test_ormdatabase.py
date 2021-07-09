#!/usr/bin/env python
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
        db.bind(provider='sqlite', filename=dbpath, create_db=True)
        db.generate_mapping(create_tables=True)

    def tearDown(self):
        pass

    def test_temp(self):
        with db_session:
            exts = Extension.select()[:]
            assert(len(exts) == 3)
            print(exts[0].id)
        __import__("nose").tools.set_trace()


