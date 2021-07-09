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
from nose.tools import *

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

import ExtAnaAnalyser as ea

class TestExtAnaAnalyser(unittest.TestCase):

    """Test ExtAnaAnalyser"""

    def setUp(self):
        self.ana = ea.ExtAnaAnalyser()

    def tearDown(self):
        pass

    def test_analyseExtension(self):
        with open("tests/extensionWithMulLib.json") as f:
            extList = json.loads(f.read())
        start = 0
        for e in extList[start:]:
            ext = MagicMock()
            ext.webstoreUrl = "https://chrome.google.com/webstore/detail/%s" % e
            ext.crxPath = os.path.abspath("tests/demoExtension.crx")
            # try:
            #     urlObj = urlopen(ext.webstoreUrl, timeout=30)
            # except Exception as e:
            #     continue
            ext.extensionId = e
            ext.id = 1
            ret = self.ana.analyseExtension(ext, headless=False)
            __import__("nose").tools.set_trace()
            # self.ana.analyseExtension(ext)
    
    def test_extract(self):
        reportsDir = os.path.join(current_dir, "testdata/reports/")
        reportFileDir = os.path.join(reportsDir, "extanalysis_report.json")
        ret = self.ana.extractAnalysisResult(reportFileDir)
        eq_(len(ret), 26, "Wrong length")
        eq_(ret[0], "js/jquery.cslider.js", "Head item wrong")
        eq_(ret[-1], "jquery-ui/external/jquery/jquery.js", "Tailitem wrong")
