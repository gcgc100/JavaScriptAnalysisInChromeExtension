#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Sqlite database configuration
"""

TABLE_LIST = {
    "FileTable": {
        "columns": {
            "id": ["INTEGER", "primary key", "autoincrement"],
            "filename": ["TEXT"],
            "filepath": ["TEXT"],
            "extensionId": ["TEXT"],
            "filetype": ["INT"],
            "hash": ["TEXT"]
        },
        "constraints": {
            "FOREIGN": ["KEY(extensionId) REFERENCES ExtensionTable(extensionId)"],
        }
    },
    "LibraryTable": {
        "columns": {
            "id": ["INTEGER", "primary key", "autoincrement"],
            "fileId": ["INTEGER"],
            "libraryId": ["INTEGER"]
        },
        "constraints": {
            "FOREIGN": ["KEY(fileId) REFERENCES FileTable(id)"],
            "FOREIGN": ["KEY(libraryId) REFERENCES LibraryInfoTable(id)"]
        }
    },
    "LibraryInfoTable": {
        "columns": {
            "id": ["INTEGER", "primary key", "autoincrement"],
            "version": ["TEXT"],
            "libname": ["TEXT"],
            "createTime": ["TEXT"],
            "vul": ["INTEGER"]
        }
    },
    "ContentScriptTable": {
        "columns": {
            "id": ["INTEGER", "primary key", "autoincrement"],
            "runAt": ["TEXT"],
            "matches": ["TEXT"],
            "fileId": ["INTEGER"]
        },
        "constraints": {
            "FOREIGN": ["KEY(fileId) REFERENCES FileTable(id)"]
        }
    },
    "JavaScriptInHtmlTable": {
        "columns": {
            "id": ["INTEGER", "primary key", "autoincrement"],
            "src": ["TEXT"],
            "htmlPath": ["TEXT"],
            "fileId": ["INTEGER"],
            "method": ["TEXT"]
        },
        "constraints": {
            "FOREIGN": ["KEY(fileId) REFERENCES FileTable(id)"]
        }
    },
    "JavaScriptIncViaContentScriptTable": {
        "columns": {
            "id": ["INTEGER", "primary key", "autoincrement"]
        }
    },
    "ExtensionTable": {
        "columns": {
            "id": ["INTEGER", "primary key", "autoincrement"],
            "extensionId": ["TEXT", "UNIQUE"],
            "category": ["TEXT"],
            "updateTime": ["DATE"],
            "ratedScore": ["TEXT"],
            "numUserRated": ["INT"],
            "userNum": ["INT"],
            "version": ["TEXT"],
            "size": ["TEXT"],
            "language": ["TEXT"],
            "downloadTime": ["DATE"],
            "downloadStatus": ["TEXT"]
        }
    },
    "PermissionTable": {
        "columns": {
            "pid": ["INTEGER", "primary key", "autoincrement"],
            "extensionId": ["TEXT"],
            "permission": ["TEXT"]
        }
    }
}
