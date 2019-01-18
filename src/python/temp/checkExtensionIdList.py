#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json

baseDataDir = "data/extensionIdList"
d = {x: json.load(open(os.path.join(baseDataDir, x))) for x in os.listdir(baseDataDir)}

d2 = {x: [len(x), len(set(x))] for x in d}


def testIns(base, data):
    base = data.keys()[base]
    print base
    for i in data:
        print i
        print len(set(data[base]) & set(data[i]))
