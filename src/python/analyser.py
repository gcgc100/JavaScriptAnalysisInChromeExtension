#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Analyser module
"""

from utils import Utils
from utils import DynamicUtils
import os
import json
import hashlib

from gClifford import sqliteDB as db
from gClifford import mylogging
logger = mylogging.logger

import DatabaseConf


class Analyser(object):

    """Analyser class""" 
    def __init__(self, dbpath):
        """init"""
        self.dbpath = dbpath
        self.init_database()

    def init_database(self):
        """init database
        :returns: TODO

        """
        #check whether database exist
        assert db.engine is None, "Database module in use"
        db.create_engine(self.dbpath)
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

    def tagVulnerableJquery(self, version):
        """Tag the vulnerable jquery version in LibraryInfoTable
        """
        db.create_engine(self.dbpath)
        db.update("update libraryInfoTable set vul=1 where version=? and libname='jquery'", version)

        db._db_ctx.connection.commit()
        db._db_ctx.connection.cleanup()
        db.engine = None

    def setFileHash(self):
        """Compute all the hash of files in db and insert them

        """
        db.create_engine(self.dbpath)
        fileArray = db.select("select * from filetable")
        for f in fileArray:
            # hash = computeHash(f["filepath"])
            if not os.path.isfile(f["filepath"]):
                continue
            with open(f["filepath"]) as fp:
                hasher = hashlib.md5()
                hasher.update(fp.read())
                hashStr = hasher.hexdigest()
            db.updateNoCommit("update filetable set hash=? where id=?", hashStr, f["id"])
        db._db_ctx.connection.commit()
        db._db_ctx.connection.cleanup()
        db.engine = None

    def analyse_extension(self, extension_path, script_folder, type_enabled=[], crxPath=None):
        """Alanyser one extension

        :extension_path: TODO
        :returns: TODO

        """
        db.create_engine(self.dbpath)
        version_dir = os.listdir(extension_path)
        assert len(version_dir) > 0, "version_dir not found"
        if len(version_dir) > 1:
            logger.warning("%s,warning: multiple version exists", 
                    extension_path)
        try:
            extension_path = os.path.join(extension_path, version_dir[0])
            if "ContentScript" in type_enabled:
                cDataFound=self._analyse_content_scripts(extension_path, script_folder)
            if "BackgroundScript" in type_enabled:
                bDataFound=self._analyse_background_scripts(extension_path, script_folder)
            if "static" in type_enabled:
                hsDataFound=self._analyse_jsinc_in_html(extension_path, script_folder, False, crxPath)
            if "dynamic" in type_enabled:
                hdDataFound=self._analyse_jsinc_in_html(extension_path, script_folder, True, crxPath)
            if cDataFound or bDataFound or hsDataFound or hdDataFound:
                # The connection is lazy loaded. If no data in scripts, it will be None.
                db._db_ctx.connection.commit()
        except Exception as e:
            logger.error("%s,error", e)
            raise e
        db._db_ctx.connection.cleanup()
        db.engine = None

    def analyse_jsinc_in_html(self, extension_path, script_folder, dynamic, crx_path=None):
        """TODO: Docstring for analyse_jsinc_in_html.

        :extension_path: TODO
        :script_folder: TODO
        :dynamic: TODO
        :crx_path: TODO
        :returns: TODO

        """
        db.create_engine(self.dbpath)
        version_dir = os.listdir(extension_path)
        assert len(version_dir) > 0, "version_dir not found"
        if len(version_dir) > 1:
            logger.warning("%s,warning: multiple version exists", 
                    extension_path)
        try:
            extension_path = os.path.join(extension_path, version_dir[0])
            hDataFound=self._analyse_jsinc_in_html(extension_path, script_folder, dynamic, crx_path)
            if hDataFound:
                # The connection is lazy loaded. If no data in scripts, it will be None.
                db._db_ctx.connection.commit()
        except Exception as e:
            logger.error("%s,error", e)
            raise e
        db._db_ctx.connection.cleanup()
        db.engine = None

    def _analyse_content_scripts(self, extension_path, script_folder):
        """Analyse content scripts and save to database

        :extension_path: TODO
        :script_folder: TODO
        :returns: False if no data found

        """
        util = Utils(script_folder)
        content_scripts = util.extract_content_scripts(extension_path)
        self.insert(content_scripts, "FileTable")
        self.insert(content_scripts, "ContentScriptTable")
        return len(content_scripts)>0

    def _analyse_background_scripts(self, extension_path, script_folder):
        """Analyse backgound scripts and save to database

        :extension_path: TODO
        :script_folder: TODO
        :returns: False if no data found

        """
        util = Utils(script_folder)
        background_scripts = util.extract_background_scripts(extension_path)
        self.insert(background_scripts, "FileTable")
        return len(background_scripts)>0

    def _analyse_jsinc_in_html(self, extension_path, script_folder, dynamic, crx_path=None):
        """Analyse javascript inclusion in html files.

        :extension_path: TODO
        :script_folder: TODO
        :dynamic: TODO
        :crx_path: TODO
        :returns: False if no data found

        """
        if dynamic:
            util = DynamicUtils(script_folder)
        else:
            util = Utils(script_folder)
        if dynamic:
            inc_scripts = util.extract_inc_javascript_in_html(extension_path, crx_path)
        else:
            inc_scripts = util.extract_inc_javascript_in_html(extension_path)
        for s in inc_scripts: 
            s["method"] = "D" if dynamic else "S"  
        self.insert(inc_scripts, "FileTable")
        self.insert(inc_scripts, "JavaScriptInHtmlTable")
        return len(inc_scripts)>0

    def insert(self, scripts, table_name):
        """Insert scripts into table based on the keys

        :scripts: TODO
        :table_name: TODO
        :returns: TODO

        """
        logger.info("%s items to be insert", len(scripts))
        for script in scripts:

            script_file = {}
            for key in DatabaseConf.\
                    TABLE_LIST[table_name]["columns"].keys():
                script_file[key] = script.get(key, None)
            if table_name == "FileTable":
                if os.path.isfile(script["filepath"]):
                    with open(script["filepath"]) as fp:
                        hasher = hashlib.md5()
                        hasher.update(fp.read())
                        hashStr = hasher.hexdigest()
                    script_file["hash"] = hashStr
            lastid = db.insertNoCommit(table_name, **script_file)[1]
            # set fileid
            if table_name == "FileTable":
                script["fileId"] = lastid

if __name__ == "__main__":
    # Analyser("../data/data.db").setFileHash()
    Analyser("../data/data.db").setExtensionDetail()
