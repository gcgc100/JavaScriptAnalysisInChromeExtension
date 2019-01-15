#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import shutil
import inspect
import unittest

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir) 

from gClifford import sqliteDB as db

from python import Analyser
from python import Extension
from python import Script

class TestAnalyser(unittest.TestCase):

    """Test analyser"""

    def setUp(self):
        self.dbpath = "tests/testdata/sqliteDB.db"
        self.script_path = "tests/testdata/scripts"

    def tearDown(self):
        try:
            shutil.rmtree(self.script_path)
            os.remove(self.dbpath)
            # pass
        except OSError:
            pass
    
    def test_proxy_detection(self):
        crxPath = os.path.join(current_dir, "testdata/demoChromeExtension/2.0.1.crx")
        srcPath = os.path.join(current_dir, "testdata/demoChromeExtension/ackklpppeabjfopekidhhdlhicdlgnib/2.0.1")
        extensionId = "aglpnpfajplhchagjjnkihgdmhjlakja"
        extension = Extension.Extension(crxPath, srcPath, extensionId = extensionId)
        Analyser.proxy_detect_javascript_in_html(extension, self.script_path)

    def test_parse_script_from_mitmproxy_log(self):
        log = 'Proxy server listening at http://*:8080\n127.0.0.1:33554: clientconnect\n127.0.0.1:33554: GET https://www.gstatic.com/chrome/intelligence/assist/ranker/models/translate/2017/03/translate_ranker_model_20170329.pb.bin HTTP/2.0\n              << 200  1.56k\n127.0.0.1:33556: clientconnect\n127.0.0.1:33558: clientconnect\n127.0.0.1:33556: GET https://lib.sinaapp.com/js/jquery/1.9.1/jquery-1.9.1.min.js\n              << 200 OK 32.01k\n'
        # log = "127.0.0.1:33554: GET https://www.gstatic.com/chrome/intelligence/assist/ranker/models/translate/2017/03/translate_ranker_model_20170329.pb.bin"
        log = log.split("\n")
        script = Script.WebpageJavaScript(htmlPath="aaa")
        Analyser.parse_script_from_mitmproxy_log(log, script)
