"use strict";

const through2   = require('through2');
const path       = require('path');

module.exports = function(){
  return through2.obj(function(file,encoding,cb){
     if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-cmd', 'Streaming not supported'));
    }

    let fpath = file.path;
    let fileStr = file.contents.toString(encoding);
    let result  = '';

    let moduleName = '';
    if(-1 != file.path.indexOf('/cmp/')){
        moduleName = `/cmp/${path.parse(fpath).name}`;
    }else if(-1 != file.path.indexOf('/tools/')){
        moduleName = `/tools/${path.parse(fpath).name}`;
    }
    
    file.contents = new Buffer('define('+ ( moduleName ? ('"' +moduleName + '",' ) : '' ) + 'function(require,exports,module){\r\n'+fileStr+'\r\n})');
    cb(null,file)

  })
}