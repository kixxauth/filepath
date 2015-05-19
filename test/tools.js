var PATH = require('path')


exports.platformString = function (str) {
  var parts = str.split('/')
    , path  = parts.join(PATH.sep)
  return PATH.resolve(path);
};

exports.platformLines = function (str) {
  var parts = str.split('\n')
  return parts.join(exports.platformLineEnding());
};

exports.platformLineEnding = function () {
  return process.platform === 'win32' ? '\r\n' : '\n';
};
