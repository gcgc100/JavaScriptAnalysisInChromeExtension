#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Test utils module
"""

import unittest
from pprint import pprint

from utils import Utils
from utils import DynamicUtils
from utils import MyHTMLParser
import utils
import shutil
import os

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

    def test_find_scripts_from_one_file(self):
        """
        test method
        """
        util_obj = Utils(self.script_data_path)
        scripts = util_obj.find_scripts_from_one_file(
                "tests/testdata/demoHTML.html")
        pprint(scripts)
        self.assertEqual(len(scripts), 4)
        scripts = util_obj.find_scripts_from_one_file(
                "tests/testdata/popupRealData.html")
        self.assertEqual(len(scripts), 8)

    def test_find_files(self):
        """
        test method
        """
        util_obj = Utils(self.script_data_path)
        extension_root_path = "tests/testdata/demoChromeExtension/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/2.0.0/"
        html_files = util_obj.find_html_files(extension_root_path)
        self.assertEqual(len(html_files), 3)
        js_files = util_obj.find_javascript_files(extension_root_path)
        self.assertEqual(len(js_files), 7)

    def test_get_extension_id(self):
        """
        test method
        """
        util_obj = Utils(self.script_data_path)
        extension_root_path = \
                "tests/testdata/hfapbcheiepjppjbnkphkmegjlipojba/2.0.37_0/"
        eid = util_obj.get_extension_id(extension_root_path)
        self.assertEqual(eid, "hfapbcheiepjppjbnkphkmegjlipojba")
        extension_root_path = \
                "tests/testdata/hfapbcheiepjegjlipojba/2.0.37_0/"
        with self.assertRaises(AssertionError):
            eid = util_obj.get_extension_id(extension_root_path)

    def test_extract_inc_javascript_in_html(self):
        """
        test method
        """
        util_obj = Utils(self.script_data_path)
        extension_root_path = \
                "tests/testdata/hfapbcheiepjppjbnkphkmegjlipojba/2.0.37_0/"
        util_obj.extract_inc_javascript_in_html(extension_root_path)

    def test_extract_content_scripts(self):
        util_obj = Utils(self.script_data_path)
        extension_root_path = "tests/testdata/manifestFiles/nothing"
        with self.assertRaises(IOError):
            util_obj.extract_content_scripts(extension_root_path)
        extension_root_path = "tests/testdata/manifestFiles/illegalManifest"
        with self.assertRaises(ValueError):
            util_obj.extract_content_scripts(extension_root_path)
        extension_root_path = "tests/testdata/manifestFiles/manifestWithoutMatches/"
        with self.assertRaises(KeyError):
            util_obj.extract_content_scripts(extension_root_path)

    def test_extract_background_scripts(self):
        util_obj = Utils(self.script_data_path)
        extension_root_path = "tests/testdata/manifestFiles/nothing"
        with self.assertRaises(IOError):
            util_obj.extract_background_scripts(extension_root_path)
        extension_root_path = "tests/testdata/manifestFiles/illegalManifest"
        with self.assertRaises(ValueError):
            util_obj.extract_background_scripts(extension_root_path)
        extension_root_path = "tests/testdata/manifestFiles/realManifest/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/0_0_0"
        scripts = util_obj.extract_background_scripts(extension_root_path)
        pprint(scripts)
        l = len(scripts)
        self.assertEqual(l, 7)
        extension_root_path = "tests/testdata/manifestFiles/manifestAsArray/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/0_0_0"
        with self.assertRaises(ValueError):
            util_obj.extract_background_scripts(extension_root_path)

class TestHtmlParser(unittest.TestCase):

    """Test my htmlparser class"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_parser(self):
        parser = MyHTMLParser()
        with open("tests/testdata/demoHTML.html") as f:
            parser.feed(f.read())
        self.assertEqual(len(parser.tags), 7)


class TestDynamicUtils(unittest.TestCase):

    """Test case docstring."""

    def setUp(self):
        self.script_data_path = "tests/testdata/scripts/"

    def tearDown(self):
        try:
            shutil.rmtree(self.script_data_path)
            os.remove("tests/testdata/sqliteDB.db")
        except OSError:
            pass

    def test_extract_inc_javascript_in_html(self):
        util_obj = DynamicUtils(self.script_data_path)
        extension_root_path = \
                "tests/testdata/demoChromeExtension/"
        crx_path = "tests/testdata/demoChromeExtension/"
        extensionId = filter(lambda x: x.startswith("ackkl"), os.listdir(extension_root_path))[0]
        extension_root_path = "{0}{1}/2.0.1/".format(extension_root_path, extensionId)
        crx_path = "{0}/2.0.1.crx".format(crx_path)
        # __import__("nose").tools.set_trace()
        # extension_root_path = \
        #         "tests/testdata/demoChromeExtension/dnofknmbhhhdjjkggjomodppapocaino/2.0.1/"
        util_obj.extract_inc_javascript_in_html(extension_root_path, crx_path)
