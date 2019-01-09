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

class Extension(object):

    """The object for an Chrome extension"""

    def __init__(self, crxPath, srcPath=None, extensionId=None, category=None,
            updateTime=None, ratedScore=None, numUserRated=None, version=None,
            size=None, language=None, downloadTime=None):
        self._crxPath = crxPath
        self._srcPath = srcPath
        extensionId=None
        self._category = category
        self._updateTime = updateTime
        self._ratedScore = ratedScore
        self._numUserRated = numUserRated
        self._version = version
        self._size = size
        self._language = language
        self._downloadTime = downloadTime

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
