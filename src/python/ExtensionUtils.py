#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json
from datetime import datetime

from utils import Utils
from gClifford import sqliteDB as db
from gClifford import mylogging
logger = mylogging.logger

import DatabaseConf

def init_database(dbpath):
    """init database
    :returns: TODO

    """
    #check whether database exist
    if db.engine is None:
        db.create_engine(dbpath)
    for table_name, table_define in DatabaseConf.TABLE_LIST.iteritems():
        if table_name == "ExtensionIdTable":
            continue
        sql = "CREATE TABLE IF NOT EXISTS " + table_name + " ("
        for column_name, attrs in table_define["columns"].iteritems():
            sql = "{0} {1}".format(sql, column_name)
            for attr in attrs:
                sql = "{0} {1}".format(sql, attr)
            sql = sql + ","
        for constraint_name, attrs in \
                table_define.get("constraints", {}).iteritems():
            sql = "{0} {1}".format(sql, constraint_name)
            for attr in attrs:
                sql = "{0} {1}".format(sql, attr)
            sql = sql + ","
        sql = sql[:-1] + ")"
        db.update(sql)
    db._db_ctx.connection.cleanup()
    db.engine = None

def addExtensionId(dbpath, extensionIdJson, category):
    """Add the extension id in extensionIdJson file to sqlite database,
    if the extension id is in extensionIdExcluded, it will be ignored

    :dbpath: sqlite database path
    :extensionIdJson: extension id list json file
    :category: The category of the extensions
    :returns: TODO

    """
    with open(extensionIdJson) as f:
        extensionIdList = json.load(f)
    assert db.engine is None, "database in use"
    db.create_engine(dbpath)
    for extensionId in extensionIdList:
        try:
            db.insertNoCommit("extensionTable", 
                    **{"extensionId": extensionId, "category": category})
        except Exception as e:
            if e.message.startswith("UNIQUE constraint failed"):
                logger.warning(e)
                logger.warning("{0}:{1}".format(extensionId,category))
            else:
                logger.error(e)
                logger.error("{0}:{1}".format(extensionId,category))
    db._db_ctx.connection.commit()
    db._db_ctx.connection.cleanup()
    db.engine = None


def setExtensionDetail(dbpath):
    """TODO: Docstring for setExtensionDetail.

    :returns: TODO

    """
    db.create_engine(dbpath)
    extensionArray = db.select("select * from extensionTable where version is null and updateTime is not '404' order by id")
    for e in extensionArray:
        eid = e["extensionId"]
        logger.info("Start to get detail of %s(%s)" % (eid, e["id"]))
        detail = Utils.getExtensionDetail(eid)
        if detail is None:
            logger.error("Getting %s detail failed" % eid)
            continue
        detailKeys = detail.keys()
        sql = "update ExtensionTable set %s=?" % detailKeys[0]
        detailValues = [detail[detailKeys[0]]]
        for k in detailKeys[1:]:
            sql = "%s,%s=?" % (sql, k)
            detailValues.append(detail[k])
        sql = "%s where extensionId=?" % sql
        detailValues.append(eid)
        db.updateNoCommit(sql, *detailValues)
        db.updateNoCommit("update extensionTable set downloadTime = date('now') where extensionId=?", extensionId)
        logger.info("End of getting detail of %s" % eid)

    db._db_ctx.connection.commit()
    db._db_ctx.connection.cleanup()
    db.engine = None

def setExtensionDetailForOne(dbpath, eid):
    """Set the detail information for extension with eid in dbpath database

    :dbpath: TODO
    :eid: TODO
    :returns: TODO

    """
    db.create_engine(dbpath)
    extensionData = db.select("select * from extensionTable where extensionId=?", eid)[0]
    detail = Utils.getExtensionDetail(eid)
    if detail is None:
        logger.error("Getting %s detail failed" % eid)
        ret = 0
    else:
        dateFmtStr = "%Y-%m-%d"
        # __import__('pdb').set_trace()  # XXX BREAKPOINT
        if extensionData["updateTime"] is None:
            curUpTime = None
        else:
            curUpTime = datetime.strptime(extensionData["updateTime"], dateFmtStr)
        newUpTime = datetime.strptime(detail["updateTime"], dateFmtStr)
        if  curUpTime is None or curUpTime < newUpTime:
            detailKeys = detail.keys()
            sql = "update ExtensionTable set %s=?" % detailKeys[0]
            detailValues = [detail[detailKeys[0]]]
            for k in detailKeys[1:]:
                sql = "%s,%s=?" % (sql, k)
                detailValues.append(detail[k])
            sql = "%s where extensionId=?" % sql
            detailValues.append(eid)
            db.updateNoCommit(sql, *detailValues)
            db.updateNoCommit("update extensionTable set downloadTime = date('now') where extensionId=?", eid)
            logger.info("End of getting detail of %s" % eid)
            db._db_ctx.connection.commit()
            db._db_ctx.connection.cleanup()
            ret = 1
        elif curUpTime == newUpTime:
            ret = 2
        else:
            logger.warning("The updatetime in database is inconsistence.")
            ret = 0

    db.engine = None
    return ret
    


def _setPermission(extension_id, extension_path):
    """TODO: Docstring for setPermission.

    :extensionId: TODO
    :extensionPath: TODO
    :returns: TODO

    """
    version_dir = os.listdir(extension_path)
    assert len(version_dir) > 0, "version_dir not found"
    if len(version_dir) > 1:
        logger.warning("%s,warning: multiple version exists", 
                extension_path)
    try:
        extension_path = os.path.join(extension_path, version_dir[0])
        with open(os.path.join(extension_path, "manifest.json")) as f:
            manifest = json.load(f)
            permissions = manifest.get("permissions", [])
        return permissions
    except Exception as e:
        logger.error("%s,error", e)
        raise e


def setPermissionAllPack(dbpath, extensionCollection):
    """TODO: Docstring for setPermissionAllPack.

    :extensionCollection: TODO
    :returns: TODO

    """
    db.create_engine(dbpath)

    # Unknow error if without this line. 'NoneType' object has no attribute 'cursor'
    d = db.select("select * from extensionTable")

    if os.path.isdir(extensionCollection):
        for eid in os.listdir(extensionCollection):
            permissions = _setPermission(eid, os.path.join(extensionCollection, eid))
            for p in permissions:
                db.insertNoCommit("PermissionTable", **{"extensionId": eid, "permission": "%s" % p})
    db._db_ctx.connection.commit()
    db._db_ctx.connection.cleanup()
    db.engine = None