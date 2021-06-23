#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest
import os
import shutil
import platform

# This test is disabled, because the /tmp directory issue can not be handled
# The /tmp 
from ExtensionUtils import unpackExtAndFilldb

class TestUnpackExtension(unittest.TestCase): 
    """test UnpackExtension module"""

    def setUp(self):
        self.src_dir = "tests/testdata/extensionSrcNew/"

    def tearDown(self):
        return
        # shutil.rmtree(self.src_dir, ignore_errors=True)

    def test_unpack_extension(self):
        return

    def test_get_extension_src_path(self):
        return
