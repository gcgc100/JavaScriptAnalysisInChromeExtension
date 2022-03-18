This project is used to download Chrome extensions and extract the JavaScript Inclusions in Chrome extension.
The project is developed with python on ubuntu 16.04 LTS 64bit.
The shell script is tested with bash.

## Usage:
* Install dependency softwares:
    * Chrome
    * git
    * python
    * pip3
* Install python modules:
```
cd src/python
pip3 install -r requirements.txt
```
PONYORM module only support python 3.3-3.7。
The python3 used can be configed in src/shell/config.sh | src/shell/testConfig.sh files with PYTHON variable.
TODO: Use virtualenv to config python and modules.
* [Set up chromedriver for selenium to control Chrome](http://chromedriver.chromium.org/getting-started)
* Prepare extension id list. All the extension lists should be saved in json files in data/extensionIdList. The file name will be used as the category of the category.
The default json files are used in my experiment.
Some extension may be updated or unpublished from Chrome web store and my cause error during data collection.
It is better to generate new json files.
* Run the toot-set (The 8000 port should be free. Is is needed when detecting version):
```
make
```
* check the data. All the data will be saved to data directory.
    * crxFiles: the crx files of the Chrome extension
    * extSrc: the source code of the Chrome extesnion
    * archive: All the crx files will be compressed into .zip file and saved in archive.
    * scripts: If a JavaScript inclusion is from remote server, its source code will be downloaded and saved in scripts directory. Some of the files or sub dir names will start with '.', so don't forget to check the hidden files.
    * data.db: the sqlite database file.


## Test
```
make testShell
```
Run the project with test data. The collected data will be saved into tests directory.

Run nosetests under src/python directory to test python code.
The test_set_version.py and test_analyser.py is disabled in setup.cfg.
test_set_version.py is very slow and test_analyser.py need to config proxy in advance.

## Other Things
The library information will not be set automatically.
setTimeForjqueryVersion.sh is used to get the release time of different version of jquery.
getVul.sh is used to tag the vulnerable version of a library.

* chromedriver outdated question. Mac need verify developer.
Update newest chromedriver.
Verify developer on Mac: xattr -d com.apple.quarantine chromedriver 
[MacOS Catalina(v 10.15.3): Error: “chromedriver” cannot be opened because the developer cannot be verified. Unable to launch the chrome browser](https://stackoverflow.com/questions/60362018/macos-catalinav-10-15-3-error-chromedriver-cannot-be-opened-because-the-de)

* PonyOrm [DBSessionIsOver error due to lazy loading](https://stackoverflow.com/questions/25719869/databasesessionisover-with-pony-orm-due-to-lazy-loading)
