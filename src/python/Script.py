#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os

SCRIPT_BACKGROUND = 2
SCRIPT_CONTENTSCRIPT = 0
SCRIPT_WEBPAGE_SCRIPT = 1

class Script(object):

    """Docstring for Script. """

    def __init__(self, filename=None, filepath=None, extensionId=None,
            filetype=None, hash=None, dbID=None):
        """

        :filename: TODO
        :filepath: TODO
        :extensionId: TODO
        :filetype: TODO
        :hash: TODO
        :dbID: TODO

        """
        self._filename = filename
        self._filepath = filepath
        self._extensionId = extensionId
        self._filetype = filetype
        self._hash = hash
        self._dbID = dbID

    @property
    def filename(self):
        """filename property getter
        """
        return self._filename
    
    @filename.setter
    def filename(self, filename):
        """filename property setter
        """
        self._filename = filename

    @property
    def filepath(self):
        """filepath property getter
        """
        return self._filepath
    
    @filepath.setter
    def filepath(self, filepath):
        """filepath property setter
        """
        self._filepath = filepath

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
    def filetype(self):
        """filetype property getter
        """
        return self._filetype
    
    @filetype.setter
    def filetype(self, filetype):
        """filetype property setter
        """
        self._filetype = filetype

    @property
    def hash(self):
        """hash property getter
        """
        return self._hash
    
    @hash.setter
    def hash(self, hash):
        """hash property setter
        """
        self._hash = hash

    @property
    def dbId(self):
        """dbId property getter
        """
        return self._dbId
    
    @dbId.setter
    def dbId(self, dbId):
        """dbId property setter
        """
        self._dbId = dbId
        

class WebpageJavaScript(Script):

    """Docstring for WebpageJavaScript. """

    def __init__(self, method=None, htmlPath=None, src=None,
            dbFileId=None):
        """

        :method: TODO
        :htmlPath: TODO
        :src: TODO
        :dbFileId: TODO

        """
        Script.__init__(self)

        self._method = method
        self._htmlPath = htmlPath
        self._src = src
        self._dbFileId = dbFileId
        
    @property
    def method(self):
        """method property getter
        """
        return self._method
    
    @method.setter
    def method(self, method):
        """method property setter
        """
        self._method = method

    @property
    def htmlPath(self):
        """htmlPath property getter
        """
        return self._htmlPath
    
    @htmlPath.setter
    def htmlPath(self, htmlPath):
        """htmlPath property setter
        """
        self._htmlPath = htmlPath

    @property
    def src(self):
        """src property getter
        """
        return self._src
    
    @src.setter
    def src(self, src):
        """src property setter
        """
        self._src = src

    @property
    def dbFileId(self):
        """dbFileId property getter
        """
        return self._dbFileId
    
    @dbFileId.setter
    def dbFileId(self, dbFileId):
        """dbFileId property setter
        """
        self._dbFileId = dbFileId
