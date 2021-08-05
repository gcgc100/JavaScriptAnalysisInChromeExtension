#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import shutil
import inspect
import unittest
from datetime import datetime

from ExtensionUtils import *


class TestExtensionUtils(unittest.TestCase):

    """Test case docstring."""
    @db_session
    def fill_database(self):
        self.db.Extension(extensionId="1", 
                downloadTime = datetime.datetime.fromisoformat('2011-11-04'), 
                version = "1.0",
                extensionStatus = ExtensionStatus.PermissionSetted,
                analysedStatus = 3)
        self.db.Extension(extensionId="1", 
                downloadTime = datetime.datetime.fromisoformat('2012-11-04'), 
                version = "1.1",
                extensionStatus = ExtensionStatus.PermissionSetted,
                analysedStatus = 3)
        self.db.Extension(extensionId="1", 
                downloadTime = datetime.datetime.fromisoformat('2015-11-04'), 
                extensionStatus = ExtensionStatus.UnPublished,
                analysedStatus = 0)
        self.db.Extension(extensionId="2",
                downloadTime = datetime.datetime.fromisoformat('2012-11-04'), 
                extensionStatus = ExtensionStatus.Init
                )
        self.db.Extension(extensionId="3",
                downloadTime = datetime.datetime.fromisoformat('2012-11-04'), 
                extensionStatus = ExtensionStatus.Init
                )

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
        init_database(self.db, "tests/HighScoreAndUsernum_1000.json")
        with db_session:
            exts = self.db.Extension.select()[:]
        self.assertEqual(len(exts), 1000)
        self.assertEqual(exts[2].extensionId, "kjfohgalkgmdidfnknoebbdihpapafko")

    def test_setDetailForOne(self):
        # TODO:
        pass

    def test_extension(self):
        self.fill_database()
        with db_session:
            exts = selectExtension(self.db)[:]
        for e in exts:
            print(e)
        self.assertEqual(len(exts), 3)
