#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import inspect
import json


category_array = ["accessibility",
    "blogging",
    "bygoogle",
    "communication",
    "fun",
    "news",
    "photos",
    "productivity",
    "searchTool",
    "shopping",
    "sports",
    "webDevelopment"]
category = category_array[5]
current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
extension_id_dir = os.path.join(current_dir, "../../data/extensionIdList")
extension_crx_dir = os.path.join(current_dir, "../../data/crxFiles")

with open(os.path.join(extension_id_dir, "%s.json" % category)) as f: 
    l = len(json.load(f))
    print l

l2 = os.listdir(os.path.join(extension_crx_dir, category))
print len(l2)
