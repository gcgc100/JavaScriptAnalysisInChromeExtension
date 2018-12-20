!function(){function e(e){if(this.stream="",JSZip.support.uint8array&&e instanceof Uint8Array)this.stream=JSZip.utils.uint8Array2String(e);else if(JSZip.support.arraybuffer&&e instanceof ArrayBuffer){var t=new Uint8Array(e);this.stream=JSZip.utils.uint8Array2String(t)}else this.stream=JSZip.utils.string2binary(e);this.index=0}function t(e,t){this.options=e,this.loadOptions=t}function i(e,t){this.files=[],this.loadOptions=t,e&&this.load(e)}var r=function(e){var t,i,r="";for(i=0;i<(e||"").length;i++)t=e.charCodeAt(i),r+="\\x"+(t<16?"0":"")+t.toString(16).toUpperCase();return r},s=function(e){for(var t in JSZip.compressions)if(JSZip.compressions.hasOwnProperty(t)&&JSZip.compressions[t].magic===e)return JSZip.compressions[t];return null};e.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.stream.length<e||e<0)throw new Error("End of stream reached (stream length = "+this.stream.length+", asked index = "+e+"). Corrupted zip ?")},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(e){return this.stream.charCodeAt(e)},readInt:function(e){var t,i=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)i=(i<<8)+this.byteAt(t);return this.index+=e,i},readString:function(e){this.checkOffset(e);var t=this.stream.slice(this.index,this.index+e);return this.index+=e,t},readDate:function(){var e=this.readInt(4);return new Date(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1)}},t.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(e){var t,i;if(e.skip(22),this.fileNameLength=e.readInt(2),i=e.readInt(2),this.fileName=e.readString(this.fileNameLength),e.skip(i),-1==this.compressedSize||-1==this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory (compressedSize == -1 || uncompressedSize == -1)");if(this.compressedFileData=e.readString(this.compressedSize),null===(t=s(this.compressionMethod)))throw new Error("Corrupted zip : compression "+r(this.compressionMethod)+" unknown (inner file : "+this.fileName+")");if(this.uncompressedFileData=t.uncompress(this.compressedFileData),this.uncompressedFileData.length!==this.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch");if(this.loadOptions.checkCRC32&&JSZip.prototype.crc32(this.uncompressedFileData)!==this.crc32)throw new Error("Corrupted zip : CRC32 mismatch")},readCentralPart:function(e){if(this.versionMadeBy=e.readString(2),this.versionNeeded=e.readInt(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4),this.fileNameLength=e.readInt(2),this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");this.fileName=e.readString(this.fileNameLength),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readString(this.fileCommentLength),this.dir=!!(16&this.externalFileAttributes)},parseZIP64ExtraField:function(t){if(this.extraFields[1]){var i=new e(this.extraFields[1].value);-1===this.uncompressedSize&&(this.uncompressedSize=i.readInt(8)),-1===this.compressedSize&&(this.compressedSize=i.readInt(8)),-1===this.localHeaderOffset&&(this.localHeaderOffset=i.readInt(8)),-1===this.diskNumberStart&&(this.diskNumberStart=i.readInt(4))}},readExtraFields:function(e){var t,i,r,s=e.index;for(this.extraFields=this.extraFields||{};e.index<s+this.extraFieldsLength;)t=e.readInt(2),i=e.readInt(2),r=e.readString(i),this.extraFields[t]={id:t,length:i,value:r}},handleUTF8:function(){this.useUTF8()&&(this.fileName=JSZip.prototype.utf8decode(this.fileName),this.fileComment=JSZip.prototype.utf8decode(this.fileComment))}},i.prototype={checkSignature:function(e){var t=this.reader.readString(4);if(t!==e)throw new Error("Corrupted zip or bug : unexpected signature ("+r(t)+", expected "+r(e)+")")},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2),this.zipComment=this.reader.readString(this.zipCommentLength)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.versionMadeBy=this.reader.readString(2),this.versionNeeded=this.reader.readInt(2),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,i,r=this.zip64EndOfCentralSize-44;0<r;)e=this.reader.readInt(2),t=this.reader.readInt(4),i=this.reader.readString(t),this.zip64ExtensibleData[e]={id:e,length:t,value:i}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),this.disksCount>1)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var e,t;for(e=0;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(JSZip.signature.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readString(4)===JSZip.signature.CENTRAL_FILE_HEADER;)e=new t({zip64:this.zip64},this.loadOptions),e.readCentralPart(this.reader),this.files.push(e)},readEndOfCentral:function(){var e=this.reader.stream.lastIndexOf(JSZip.signature.CENTRAL_DIRECTORY_END);if(-1===e)throw new Error("Corrupted zip : can't find end of central directory");if(this.reader.setIndex(e),this.checkSignature(JSZip.signature.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),65535===this.diskNumber||65535===this.diskWithCentralDirStart||65535===this.centralDirRecordsOnThisDisk||65535===this.centralDirRecords||-1===this.centralDirSize||-1===this.centralDirOffset){if(this.zip64=!0,-1===(e=this.reader.stream.lastIndexOf(JSZip.signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR)))throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");this.reader.setIndex(e),this.checkSignature(JSZip.signature.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(JSZip.signature.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}},load:function(t){this.reader=new e(t),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},JSZip.prototype.load=function(e,t){var r,s,n,a;for(t=t||{},t.base64&&(e=JSZipBase64.decode(e)),s=new i(e,t),r=s.files,n=0;n<r.length;n++)a=r[n],this.file(a.fileName,a.uncompressedFileData,{binary:!0,optimizedBinaryString:!0,date:a.date,dir:a.dir});return this}}();