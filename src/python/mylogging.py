#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
My custom logging module.
The logging message format:
        '%(asctime)s %(filename)s[%(funcName)s line:%(lineno)d]'
        ' %(levelname)s, %(message)s'

The .log file will be saved in <sys.path[0]>/log, namely the log directory
in the path where you run python command
"""

import logging
import os
import sys
from functools import wraps
ROOT_DIR = os.path.abspath(sys.path[0])


def contextLog(logger, level=logging.INFO):
    """Wrap the function and log when enter and exit the function

    :logger: TODO
    :returns: TODO

    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kw):
            logger.log(level,
                       "Enter {func}".format(func=func.__name__))

            out = func(*args, **kw)

            logger.log(level, "Exit {func}".format(func=func.__name__))
            return out
        return wrapper
    return decorator


class LogConfig(object):
    """
    fhConfig: log file config
    infohConfig: info file config
    errorhConfig: error file config
    formatter: formater used to format log
    """

    fhConfig = None
    infohConfig = None
    errorhConfig = None
    formatter = None


logDir = ROOT_DIR+"/log"
if not os.path.exists(logDir):
    os.mkdir(logDir)
logConfig = LogConfig()
logConfig.fhConfig = {"filename": logDir+'/log.log'}
logConfig.infohConfig = {"filename": logDir+'/info.log'}
logConfig.errorhConfig = {"filename": logDir+'/error.log'}
logConfig.formatter = logging.Formatter(
    '%(asctime)s %(filename)s[%(funcName)s line:%(lineno)d]'
    ' %(levelname)s, %(message)s')


def configLogger(reset=True, stream=True, file=True):
    """
    Config a default logger and return the logger
    para:
        stream: Whether to show the log on the console
        file: Whether to save the log into a file.
            If true, the log will be saved to sys.path[0]/log/.
            Three kinds of logfile: log.log, info.log, error.log

    """
    # create logger with 'spam_application'
    logger = logging.getLogger(__name__)
    if reset:
        for handler in logger.handlers[:]:  # make a copy of the list
            logger.removeHandler(handler)
    logger.setLevel(logging.DEBUG)
    if len(logger.handlers) > 0:
        return logger
    # create file handler which logs even debug messages
    cfg = [[logConfig.fhConfig, logging.DEBUG],
           [logConfig.infohConfig, logging.INFO],
           [logConfig.errorhConfig, logging.ERROR]]
    if file:
        handler = None
        for handlerCfg in cfg:
            handler = logging.FileHandler(**handlerCfg[0])
            handler.setLevel(handlerCfg[1])
            handler.setFormatter(logConfig.formatter)
            logger.addHandler(handler)
    # create console handler with a higher log level
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    # create formatter and add it to the handlers
    ch.setFormatter(logConfig.formatter)
    # add the handlers to the logger
    if stream:
        logger.addHandler(ch)
    return logger

"""The default logger return from configLogger()"""
logger = configLogger(reset=False)

if __name__ == '__main__':
    l = configLogger()
    l.debug("test")
