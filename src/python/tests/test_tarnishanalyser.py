#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import inspect
import unittest
import json
import urllib
from urllib.request import urlopen

from unittest import mock
from unittest.mock import MagicMock
from unittest.mock import patch


current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import TarnishAnalyser as ta

class TestTarnishAnalyser(unittest.TestCase):

    """Test tarnishAnalyser"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_analyseExtension(self):
        # with open("tests/HighScoreAndUsernum_1000.json") as f:
        with open("tests/extensionWithMulLib.json") as f:
            extList = json.loads(f.read())
        start = 0
        for e in extList[start:]:
            ext = MagicMock()
            ext.webstoreUrl = "https://chrome.google.com/webstore/detail/%s" % e
            try:
                urlObj = urlopen(ext.webstoreUrl, timeout=30)
            except Exception as e:
                continue
            ext.extensionId = e
            ext.id = 1
            ta.analyseExtension(ext, False)

