#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest

from analyser import Analyser
import analyser
import shutil
import os

from gClifford import sqliteDB as db

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

    def test_init(self):
        Analyser(self.dbpath)

    def test_analyse_extension(self):
        myanalyser = Analyser(self.dbpath)
        myanalyser.analyse_extension(
                "tests/testdata/demoChromeExtension/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                self.script_path)
        if db.engine is None:
            db.create_engine("tests/testdata/sqliteDB.db")
        fileTableCount = db.select("select count(*) as c from FileTable")[0]["c"]
        self.assertEqual(fileTableCount, 19)
        contentScriptTableCount = db.select("select count(*) as c from ContentScriptTable")[0]["c"]
        self.assertEqual(contentScriptTableCount, 3)
        jsInHtmlTableCount = db.select("select count(*) as c from JavaScriptInHtmlTable")[0]["c"]
        self.assertEqual(jsInHtmlTableCount, 16)
        db._db_ctx.connection.cleanup()
        db.engine = None
