#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json
from datetime import datetime

import utils
from OrmDatabase import *
from gClifford import mylogging
logger = mylogging.logger

import DatabaseConf

def init_database(extensionIdJson, category):
    """init database
    :returns: TODO

    """
    addExtensionId(extensionIdJson, category)

def addExtensionId(extensionIdJson, category):
    """Add the extension id in extensionIdJson file to sqlite database,
    if the extension id is in extensionIdExcluded, it will be ignored

    :dbpath: sqlite database path
    :extensionIdJson: extension id list json file
    :category: The category of the extensions
    :returns: TODO

    """
    with open(extensionIdJson) as f:
        extensionIdList = json.load(f)
    with db_session:
        for extensionId in extensionIdList:
            extension = Extension(extensionId=extensionId, category=category, downloadStatus=0)

def setExtensionDetailForOne(extension):
    """Set the detail information for extension

    :eid: TODO
    :returns: TODO

    """
    eid = extension.extensionId
    detail = utils.getExtensionDetail(eid)
    if detail is None:
        logger.error("Getting %s detail failed" % eid)
        ret = 0
    elif type(detail) == int:
        ret = detail
    else:
        dateFmtStr = "%Y-%m-%d"
        # __import__('pdb').set_trace()  # XXX BREAKPOINT
        if extension.updateTime is None:
            curUpTime = None
        else:
            curUpTime = extension.updateTime
            # curUpTime = datetime.strptime(extension.updateTime, dateFmtStr)
        if detail["updateTime"] == "404":
            newUpTime = "404"
        else:
            newUpTime = datetime.datetime.strptime(detail["updateTime"], dateFmtStr)
        if  curUpTime is None or newUpTime == "404" or curUpTime < newUpTime:
            detail["updateTime"] = datetime.datetime.strptime(detail["updateTime"], dateFmtStr)
            extension.set(**detail)
            extension.downloadTime = datetime.datetime.now()
            extension.downloadStatus = 1
            logger.info("End of getting detail of %s" % eid)
            ret = 1
        elif curUpTime == newUpTime:
            ret = 2
        else:
            logger.warning("The updatetime in database is inconsistence.")
            ret = 0

    return ret

def resetInfoForExtension(extension):
    """Reset the information of an extension in database

    :dbpath: TODO
    :eid: TODO
    :returns: TODO

    """
    extension.downloadTime = None
    extension.language = ""
    extension.updateTime = None
    extension.ratedScore = ""
    extension.size = ""
    extension.userNum = -1 
    extension.version = "" 
    extension.numUserRated =  -1
    extension.downloadStatus = 0

def setInfoForExtension(extension, retCode):
    """TODO: Docstring for setInfoForExtension.

    :dbpath: TODO
    :eid: extesion id
    :retCode: ret code(40X) when download crx file
    :returns: TODO

    """
    extension.downloadStatus = retCode

@db_session
def setPermissionAllPack(extensionCollection):
    """TODO: Docstring for setPermissionAllPack.

    :extensionCollection: TODO
    :returns: TODO

    """
    # Unknow error if without this line. 'NoneType' object has no attribute 'cursor'
    if os.path.isdir(extensionCollection):
        for eid in os.listdir(extensionCollection):
            extension = Extension.get(extensionId=eid)
            permissions = extension.getPermissions()
            for p in permissions:
                permission= ExtensionPermission(permission = p, extension = extension)
