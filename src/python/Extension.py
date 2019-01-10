#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json


from gClifford import mylogging
logger = mylogging.logger


EXTENSION_STATUS_INIT = 0
EXTENSION_STATUS_UNPACKED = 1
EXTENSION_STATUS_ANALYSED = 2

from Script import Script
from Script import WebpageJavaScript

class Extension(object):

    """The object for an Chrome extension"""

    def __init__(self, crxPath, srcPath=None, extensionId=None, category=None,
            updateTime=None, ratedScore=None, numUserRated=None, version=None,
            size=None, language=None, downloadTime=None, dbID=None):
        self._crxPath = crxPath
        self._srcPath = srcPath
        self._extensionId=extensionId
        self._category = category
        self._updateTime = updateTime
        self._ratedScore = ratedScore
        self._numUserRated = numUserRated
        self._version = version
        self._size = size
        self._language = language
        self._downloadTime = downloadTime
        self._dbID = dbID
        self._scripts = []

    def detectScript(self, method):
        """Analyse the Chrome extensin and detect all JavaScript. Saved in scripts property

        :method: TODO
        :returns: TODO

        """

        if method == "S":
            pass
        elif method == "D":
            pass
        else:
            raise Exception()

    @property
    def permissions(self):
        try:
            extension_path = self._srcPath
            with open(os.path.join(extension_path, "manifest.json")) as f:
                manifest = json.load(f)
                permissions = manifest.get("permissions", [])
            return permissions
        except Exception as e:
            logger.error("%s,error", e)
            raise e
    @property
    def manifest(self):
        with open(os.path.join(self._srcPath, "manifest.json")) \
                as manifest_file:
            manifest = json.load(manifest_file)
            if type(manifest) == list:
                raise ValueError()
        return manifest

    @property
    def htmlFiles(self):
        return self._find_files_with_ext(".html")

    def _find_files_with_ext(self, file_ext):
        """Find all the files with certain ext in this extension source code

        :file_ext: target file's ext
        :returns: html path list

        """
        html_file_array = []
        for (root, dirs, files) in os.walk(self.srcPath):
            for one_file in files:
                if not one_file.startswith(".") and one_file.endswith(file_ext):
                    html_file_array.append(os.path.join(root, one_file))

        return html_file_array

    @property
    def extensionId(self):
        """extensionId property getter
        """
        return self._extensionId
    
    @extensionId.setter
    def extensionId(self, extensionId):
        """extensionId property setter
        """
        self._extensionId = extensionId

    @property
    def srcPath(self):
        """srcPath property getter
        """
        return self._srcPath
    
    @srcPath.setter
    def srcPath(self, srcPath):
        """srcPath property setter
        """
        self._srcPath = srcPath

    @property
    def crxPath(self):
        """crxPath property getter
        """
        return self._crxPath
    
    @crxPath.setter
    def crxPath(self, crxPath):
        """crxPath property setter
        """
        self._crxPath = crxPath

    @property
    def scripts(self):
        """scripts property getter
        """
        return self._scripts
    
    @scripts.setter
    def scripts(self, scripts):
        """scripts property setter
        """
        self._scripts = scripts

    def __str__(self):
        return "{0}{1}{2}{3}".format(self._extensionId, self._srcPath, self._crxPath, self._dbID)
