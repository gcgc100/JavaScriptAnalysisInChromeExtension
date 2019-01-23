#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Test utils module
"""

import unittest
from pprint import pprint

from python import utils
import shutil
import os
import time

class TestUtils(unittest.TestCase):

    """Test utils module"""

    def setUp(self):
        self.script_data_path = "tests/testdata/scripts/"

    def tearDown(self):
        try:
            shutil.rmtree(self.script_data_path)
            os.remove("tests/testdata/sqliteDB.db")
        except OSError:
            pass

    def test_mitmproxy(self):
        p = utils.mitmproxy_start()
        time.sleep(2)
        utils.mitmproxy_stop(p)
        s = p.stdout.readline()
        print(s)


class TestHtmlParser(unittest.TestCase):

    """Test my htmlparser class"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_parser(self):
        parser = utils.MyHTMLParser()
        with open("tests/testdata/demoHTML.html") as f:
            parser.feed(f.read())
        self.assertEqual(len(parser.tags), 7)
