#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import shutil
import unittest
import tempfile


from gClifford import sqliteDB as db

import AddExtensionId

class TestAddExtensionId(unittest.TestCase):

    """Test case docstring."""

    def setUp(self):
        self.testDataDir = "tests/testdata/addExtension"
        self.testExtensionIdJsonFile = os.path.join(self.testDataDir, 'extensionIdList.json')
        self.extensionExcluded = os.path.join(self.testDataDir, 'extensionFailDownload')
        self.tempdir = tempfile.mkdtemp()
        self.sqliteDB = os.path.join(self.tempdir, 'sqlite.db')
        AddExtensionId.init_database(self.sqliteDB) 

    def tearDown(self):
        shutil.rmtree(self.tempdir)

    def test_addExtensionId(self):
        AddExtensionId.addExtensionId(self.sqliteDB, 
                self.testExtensionIdJsonFile,
                "test",
                self.extensionExcluded)
        db.create_engine(self.sqliteDB)
        data = db.select("select * from extensionTable")
        self.assertEqual(len(data), 14)
        self.assertEqual(data[0]["category"], "test")
        idList = [d["extensionId"] for d in data]
        self.assertTrue("bnomihfieiccainjcjblhegjgglakjdd" in idList)
        self.assertFalse("lajondecmobodlejlcjllhojikagldgd" in idList)
        db._db_ctx.connection.cleanup()
        db.engine = None
