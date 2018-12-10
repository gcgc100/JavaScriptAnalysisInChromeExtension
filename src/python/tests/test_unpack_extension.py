#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest
import os
import shutil
import platform

# This test is disabled, because the /tmp directory issue can not be handled
# The /tmp 
import UnpackExtension
class TestUnpackExtension(unittest.TestCase): 
    """test UnpackExtension module"""

    def setUp(self):
        self.src_dir = "tests/testdata/extensionSrcNew/"

    def tearDown(self):
        return
        # shutil.rmtree(self.src_dir, ignore_errors=True)

    def test_unpack_extension(self):
        return
        crx_path = "tests/testdata/testCrx.crx"
        src_dir = self.src_dir
        # if not os.path.exists(src_dir):
        #     os.mkdir(src_dir)
        UnpackExtension.unpack_extension(crx_path, src_dir)

    def test_get_extension_src_path(self):
        return
        if platform.system() == "Linux":
            shutil.move("/tmp", "tests/testdata/tmpBackup")
            tmpTestData = "normalTmp"
            shutil.copytree(
                    os.path.join(
                    "tests/testdata/extensionSrcPathTestdata/", tmpTestData), 
                    "/tmp")
            extension_path = UnpackExtension.get_extension_src_path()
            self.assertTrue(extension_path.startswith(
                "/tmp/.org.chromium.Chromium.aaaaF3"))
            shutil.rmtree("/tmp/")

            tmpTestData = "tmpEmpty"
            shutil.copytree(
                    os.path.join(
                    "tests/testdata/extensionSrcPathTestdata/", tmpTestData), 
                    "/tmp")
            extension_path = UnpackExtension.get_extension_src_path()
            self.assertIsNone(extension_path)
            shutil.rmtree("/tmp/")

            tmpTestData = "tmpWithMulSrc"
            shutil.copytree(
                    os.path.join(
                    "tests/testdata/extensionSrcPathTestdata/", tmpTestData), 
                    "/tmp")
            with self.assertRaises(AssertionError):
                extension_path = UnpackExtension.get_extension_src_path()
            shutil.rmtree("/tmp/")

            shutil.move("tests/testdata/tmpBackup", "/tmp/")
