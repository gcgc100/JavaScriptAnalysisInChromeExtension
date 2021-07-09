#!/usr/bin/env python
# -*- coding: utf-8 -*-

from mymodule import os

import unittest
from unittest import mock

class RmTestCase(unittest.TestCase):
    
    # @mock.patch.object(os, "rm")
    # def test_rm(self, mock_os):
    def test_rm(self):
        os().rm("any path")
        # test that rm called os.remove with the right parameters
        # mock_os.remove.assert_called_with("any path")
