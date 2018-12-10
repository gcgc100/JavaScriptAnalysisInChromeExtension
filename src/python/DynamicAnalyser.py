#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os

from gClifford import sqliteDB as db
from gClifford import mylogging
logger = mylogging.logger

import DatabaseConf
from utils import DynamicUtils
from analyser import Analyser


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
        if db.engine is None:
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

    def analyse_extension(self, extension_path, script_folder):
        """Alanyser one extension

        :extension_path: TODO
        :returns: TODO

        """
        util = DynamicUtils(script_folder)
        version_dir = os.listdir(extension_path)
        assert len(version_dir) > 0, "version_dir not found"
        if len(version_dir) > 1:
            logger.warning("%s,warning: multiple version exists", 
                    extension_path)
        try:
            extension_path = os.path.join(extension_path, version_dir[0])
            content_scripts = util.extract_content_scripts(extension_path)
            background_scripts = util.extract_background_scripts(extension_path)
            inc_scripts = util.extract_inc_javascript_in_html(extension_path)
        except Exception as e:
            logger.error("%s,error", e)
            raise e
        # self.insert(background_scripts, "FileTable")

        # FileTable must be insert first, so that the fileId is generated
        self.insert(content_scripts + inc_scripts + background_scripts, "FileTable")
        self.insert(content_scripts, "ContentScriptTable")
        self.insert(inc_scripts, "JavaScriptInHtmlTable")

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
            lastid = db.insertNoCommit(table_name, **script_file)[1]
            # set fileid
            if table_name == "FileTable":
                script["fileId"] = lastid
        db._db_ctx.connection.commit()
