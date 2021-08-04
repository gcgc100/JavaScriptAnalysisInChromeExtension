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
        dbpath = "tests/tempdb/testExtUtils.db"
        dbpath = os.path.abspath(dbpath)
        self.db = define_database_and_entities(provider='sqlite', filename=dbpath, create_db=True)
        self.tempCrxDir = "tests/tempCrx"
        self.tempDir = "tests/testdata/temp"
        self.demoExt = "tests/testdata/demoExtension.crx"

    def tearDown(self):
        self.db.drop_all_tables(with_all_data=True)

    def test_downloadExt(self):
        extId = "foieejideloffcogfliehljobfocglfc"
        extNewName = "newName"
        downloadExt(extId, extNewName, self.tempCrxDir)
        crxList = os.listdir(self.tempCrxDir)
        self.assertTrue(extNewName+".crx" in crxList)
        os.remove(os.path.join(self.tempCrxDir, extNewName+".crx"))

        downloadExt(extId, save_path= self.tempCrxDir)
        crxList = os.listdir(self.tempCrxDir)
        self.assertTrue(extId+".crx" in crxList)
        os.remove(os.path.join(self.tempCrxDir, extId+".crx"))

    def test_unpack(self):
        extSrc = os.path.join(self.tempDir, "extSrc")
        unpackExtension(self.demoExt, extSrc)
        self.assertTrue("extSrc" in os.listdir(self.tempDir))
        shutil.rmtree(extSrc)

    def test_init_database(self):
        init_database("tests/HighScoreAndUsernum_1000.json", self.db)
        with db_session:
            exts = self.db.Extension.select()[:]
        self.assertEqual(len(exts), 1000)
        self.assertEqual(exts[2].extensionId, "kjfohgalkgmdidfnknoebbdihpapafko")

    def test_setDetailForOne(self):
        # TODO:
        pass
