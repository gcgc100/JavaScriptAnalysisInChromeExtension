INSERT INTO Extension (id, extensionId, category, ratedScore, version, size, language, crxPath, srcPath, downloadTime, updateTime, numUserRated, userNum) 
SELECT id, extensionId, category, ifnull(ratedScore,''), ifnull(version,''), ifnull(size, ''), ifnull(language,''), '', '', DATETIME('2018-06-01'), updateTime, numUserRated, userNum FROM ExtensionTable;

UPDATE Extension SET updateTime = DATE('1000-01-01') WHERE updateTime = '404';

INSERT INTO ExtensionPermission (permission)
SELECT DISTINCT(TRIM(permission)) FROM PermissionTable;

INSERT INTO JavaScriptInclusion (extension, id, runAt, filepath, hash, url, htmlPath, classtype) 
SELECT e.id as eid, t.id as id, method, filepath, ifnull(hash, ''), ifnull(src,''), ifnull(htmlPath, ''), 'ExtensionWebpageScript' FROM ExtensionTable e INNER JOIN (SELECT f.id as id, f.extensionId, method, filepath, hash, src, htmlPath  FROM  FileTable f INNER JOIN JavaScriptInHtmlTable j WHERE f.id = j.fileId) t WHERE e.extensionId = t.extensionId;

INSERT INTO JavaScriptInclusion (extension, id, filepath, hash, classtype)
SELECT e.id as eid, t.id as id, filepath, ifnull(t.hash, ''), 'BackgroundScript' FROM ExtensionTable e INNER JOIN (SELECT id, extensionId, filepath, hash FROM  FileTable WHERE filetype=2) t WHERE e.extensionId = t.extensionId;

INSERT INTO JavaScriptInclusion (extension, id, filepath, hash, classtype)
SELECT e.id as eid, t.id as id, filepath, ifnull(t.hash, ''), 'ContentScript' FROM ExtensionTable e INNER JOIN (SELECT id, extensionId, filepath, hash FROM  FileTable WHERE filetype=0) t WHERE e.extensionId = t.extensionId;


INSERT INTO Extension_ExtensionPermission (extension, extensionpermission)
SELECT DISTINCT eid, id FROM ExtensionPermission ep INNER JOIN (SELECT e.id as eid, p.pid as pid, e.extensionId as extensionId, TRIM(p.permission) as permission FROM extensionTable e INNER JOIN PermissionTable p WHERE e.extensionId = p.extensionId) p WHERE ep.permission = p.permission;

INSERT INTO Library (id, libname, version, releaseTime)
SELECT id, libname, version, datetime(createTime) FROM LibraryInfoTable WHERE version != 'None' and version != '100';

INSERT INTO JavaScriptInclusion_Library (JavaScriptInclusion, Library)
SELECT f.id as fid, l.libraryId as lid FROM FileTable f INNER JOIN LibraryTable l WHERE f.id = l.fileId and l.version != 'None' and l.version != '100';

UPDATE JavaScriptInclusion SET detectMethod = 1, runAt=NULL WHERE runAt='D';
UPDATE JavaScriptInclusion SET detectMethod = 2, runAt=NULL WHERE runAt='S';

DROP TABLE ExtensionTable;
DROP TABLE ContentScriptTable;
DROP TABLE JavaScriptInHtmlTable;
DROP TABLE PermissionTable;
DROP TABLE FileTable;
DROP TABLE SampleExtensionIdTable;
DROP TABLE JavaScriptIncViaContentScriptTable;
DROP TABLE libraryInfoTable;
DROP TABLE LibraryTable;
DROP VIEW efTable;
DROP VIEW eflTable;
DROP VIEW multiLibInclusion;




-- SELECT * FROM (SELECT f.id as fid, l.libraryId as lid FROM FileTable f INNER JOIN LibraryTable l WHERE f.id = l.fileId and l.version != 'None' and l.version != '100')
-- WHERE lid not in (SELECT id FROM Library);

