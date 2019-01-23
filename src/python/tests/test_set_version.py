#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest
import os

import SetVersion 

# need manually prepare jqueryServer folder


class TestSetVersion(unittest.TestCase):

    """Test SetVersion"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_simple_server(self):
        return
        httpd = SetVersion.simple_server()
        import time
        time.sleep(3)
        httpd["httpd"].shutdown()

    def test_selenium_get_version(self):
        httpd = SetVersion.simple_server()
        driver = SetVersion.prepareSelenium()
        jquerySrcDir = "tests/testdata/libSrc/jquerySrc/"
        underscoreSrcDir = "tests/testdata/libSrc/underscoreSrc/"
        libSrcList = [os.path.join(jquerySrcDir, "jquery-3.2.1.js"),
                os.path.join(jquerySrcDir, "jquery-2.2.4.js"),
                os.path.join(underscoreSrcDir, "underscore.js")]
        for libSrc in libSrcList:
            ret = SetVersion.selenium_get_version1(libSrc,
                    driver,
                    lib_type_array = ["jquery", "Underscore"])
            print(ret)
        SetVersion.shutdownChrome(driver)
        httpd = httpd.get("httpd", None)
        httpd.shutdown()
        httpd.server_close()
        # jquerySrcDir = "tests/testdata/jquerySrc/"
        # ret = SetVersion.selenium_get_version(
        #         os.path.join(jquerySrcDir, "jquery-3.2.1.js"),
        #         lib_type_array = ["jquery"])
        # self.assertEqual(ret["jquery"], '3.2.1')
        return
        jqueryFileArray = os.listdir(jquerySrcDir)
        jqueryFileArray = sorted(jqueryFileArray)
        httpd = SetVersion.simple_server()
        for f in jqueryFileArray:
            print(f)
            version = SetVersion.selenium_get_verion( 
                    os.path.join(jquerySrcDir, f),
                    blockRun=True
                    )
            print("version:%s" % version)
        httpd["httpd"].shutdown()

    def test_jquery_version(self):
        return
        jquerySrcDir = "tests/testdata/libSrc/jquerySrc/"
        version = SetVersion.set_jquery_version_for_one_file("tests/testdata/jquery.js")
        self.assertEqual(version, "2.1.4")
        version = SetVersion.set_jquery_version_for_one_file("tests/testdata/notjquery.js")
        self.assertIsNone(version)
        for f in os.listdir(jquerySrcDir):
            print(f)
            version = SetVersion.set_jquery_version_for_one_file(
                    os.path.join(jquerySrcDir, f))
            print("version:%s" % version)


    def test_jquery_all(self):
        return
        SetVersion.set_all_version()
