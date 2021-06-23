#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
from datetime import datetime
import urllib
import urllib.request
import zipfile

import utils
from OrmDatabase import *
import mylogging
logger = mylogging.logger


def downloadExt(id, name="", save_path=""):
    ext_id = id
    if name == "":
        save_name = ext_id
    else:
        save_name = name
    if save_path == "":
        save_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data/extensionsInCrx")
    # os.makedirs(save_path, exist_ok=True)
    save_path = save_path + "/" + save_name + ".crx"
    logger.debug("Downloader says: save_path is " + save_path)
    # new download URL, issue #13
    dl_url = "https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=81.0.4044.138&acceptformat=crx2,crx3&x=id%3D" + ext_id + "%26uc"
    print("Download URL: " + dl_url)

    try:
        urllib.request.urlretrieve(dl_url, save_path)
        logger.debug("Extension downloaded successfully: " + save_path)
        return save_name
    except urllib.error.HTTPError as e:
        if e.reason == 'error-invalidAppId':
            __import__('pdb').set_trace()  # XXX BREAKPOINT
            with open(os.path.dirname(save_path)+"/unexistExt.md", 'a') as f: 
                f.write(ext_id + "\n")
        else:
            logger.debug("urllib error")
            logger.debug(e)
    except Exception as e:
        logger.debug("Error in downloader.py")
        logger.debug(e)
        return False

def downloadExtList(extList, save_path=""):
    for ext in extList:
        downloadExt(ext)

def unpackExtAndFilldb(eid, crxPath, extSrcPath):
    """TODO: Docstring for unpackExtAndFilldb.

    :database: TODO
    :returns: TODO

    """
    with db_session:
        e = Extension.get(extensionId = eid, crxPath=crxPath)
        assert(e is not None)
        e.srcPath = extSrcPath
        unpackExtension(crxPath, extSrcPath)

def unpackExtension(crxPath, extSrcPath):
    """TODO: Docstring for unpackExtension.

    :eid: TODO
    :crxPath: TODO
    :returns: TODO

    """
    zip_contents = zipfile.ZipFile(crxPath, 'r')
    zip_contents.extractall(extSrcPath)
    zip_contents.close()

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

@db_session
def setPermissionAllPack(extensionCollection):
    """TODO: Docstring for setPermissionAllPack.

    :extensionCollection: TODO
    :returns: TODO

    """
    # Unknow error if without this line. 'NoneType' object has no attribute 'cursor'
    if os.path.isdir(extensionCollection):
        for eid in os.listdir(extensionCollection):
            extPath = os.path.join(extensionCollection, eid)
            extension = Extension.get(extensionId=eid, srcPath=extPath)
            permissions = extension.getPermissions()
            for p in permissions:
                permission = ExtensionPermission.get(permission = p)
                if permission is None:
                    permission= ExtensionPermission(permission = p)
                permission.extensions.add(extension)
                extension.permissions.add(permission)
