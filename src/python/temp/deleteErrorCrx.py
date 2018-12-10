#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
import os
import inspect
import json
import sys
import shutil

#disabled, in case unintended delete files
# exit(1)

index = int(sys.argv[1])
# category_array = ["accessibility",
#     "blogging",
#     "bygoogle",
#     "communication",
#     "fun",
#     "news",
#     "photos",
#     "productivity",
#     "searchTool",
#     "shopping",
#     "sports",
#     "webDevelopment"]
category_array = ["productivity"]
category = category_array[index]
cap_category = category[0].upper() + category[1:]

current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
error_dir = os.path.join(current_dir, "../../data/crxFiles/ErrorCrx")
error_filename = "UnpackCrxError%s.log" % cap_category

error_crx_array = []
# with open(os.path.join(error_dir, error_filename)) as f:
#     for l in f:
#         r = re.match("\.\./\.\./extCrxFiles/([a-z]{32})\.crx", l)
#         error_crx_array.append(r.group(1))

crx_dir = os.path.join(current_dir, "../../data/crxFiles", category)
crx_file_list = os.listdir(crx_dir)

src_dir = os.path.join(current_dir, "../../data/extSrcFinal")
src_file_list = os.listdir(src_dir)
src_file_list = [x[10:] for x in src_file_list]

ret = []
for ext in crx_file_list:
    extId = ext[0:32]
    if extId not in src_file_list:
        print(extId)
        # ret.append(extId)
        shutil.copy(os.path.join(crx_dir, ext), os.path.join("../../../extCrxFiles/", ext))

# print len(ret)
exit(0)

extension_id_dir = os.path.join(current_dir, "../../data/extensionIdList")

with open(os.path.join(extension_id_dir, "%s.json" % category)) as f: 
    id_list = json.load(f)

print len(id_list)
# exit(0)
for crx in crx_file_list:
    if crx[:32] in id_list:
        pass
    else:
        print crx[:32]

#delete error crx
# for ext in error_crx_array:
#     if "%s.crx" % ext in crx_file_list and ext not in src_file_list:
#         os.remove(os.path.join(crx_dir, "%s.crx" % ext))
#         print "delete %s" % ext
