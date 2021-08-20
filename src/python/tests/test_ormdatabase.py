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
        demoExtensionPath="tests/testdata/demoChromeExtension"
        extension1 = db.Extension(extensionId="ackklpppeabjfopekidhhdlhicdlgnib", 
                srcPath=os.path.join(demoExtensionPath, "ackklpppeabjfopekidhhdlhicdlgnib/2.0.1"), 
                crxPath="tests/testdata/demoExtension.crx",
                version="2.0.1")
        self.ext = extension1
        extension2 = db.Extension(extensionId="002", 
                srcPath=os.path.join(demoExtensionPath, "blank/"))
        extension3 = db.Extension(extensionId="003",
                srcPath=demoExtensionPath)
        js1 = db.JavaScriptInclusion(extension=extension1,
                filepath=os.path.join(extension1.srcPath, "background.js"),
                detectMethod = DetectMethod.Static)
        self.js = js1
        js2 = db.JavaScriptInclusion(extension=extension1,
                filepath=os.path.join(extension1.srcPath, "options.js"),
                detectMethod = DetectMethod.Static)
    @db_session
    def test_manifest(self):
        ext = self.db.Extension.get(extensionId="ackklpppeabjfopekidhhdlhicdlgnib")
        self.assertEqual(ext.manifest["name"], "Notification Demo",)
        ext = self.db.Extension.get(extensionId="002")
        with self.assertRaises(FileNotFoundError) as context:
            ext.manifest
        ext = self.db.Extension.get(extensionId="003")
        with self.assertRaises(Exception) as context:
            ext.manifest
        self.assertEqual(str(context.exception), 'mainfest file not exists for extension:003')

    def test_webstoreUrl(self):
        ext = self.ext
        self.assertEqual(ext.webstoreUrl, 
                "https://chrome.google.com/webstore/detail/ackklpppeabjfopekidhhdlhicdlgnib")

    def test_htmlFiles(self):
        ext = self.ext
        self.assertEqual(len(ext.htmlFiles), 1)

    def test_standardCrxPath(self):
        ext = self.ext
        self.assertEqual(ext.standardCrxPath("./"), "./ackklpppeabjfopekidhhdlhicdlgnib/2-0-1.crx")

    def test_standardExtSrcPath(self):
        ext = self.ext
        self.assertEqual(ext.standardExtSrcPath("./"), "./ackklpppeabjfopekidhhdlhicdlgnib/2-0-1")

    def test_getPermissions(self):
        ext = self.ext
        self.assertIn("notifications", self.ext.getPermissions())

    # def test_setPermissions(self):
    #     ext = self.ext
    #     ext.setPermissions()
    #     __import__("nose").tools.set_trace()
    #     self.assertEqual(len(self.permissions), 2)

    def test_jsFilename(self):
        js = self.js
        self.assertEqual(js.filename, "background.js")
