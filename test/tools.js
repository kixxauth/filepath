var PATH = require('path')


exports.platformString = function (str) {
  var parts = str.split('/')
  return parts.join(PATH.sep);
};

exports.platformLines = function (str) {
  var parts = str.split('\n')
  return parts.join(exports.platformLineEnding());
};

exports.platformLineEnding = function () {
  return process.platform === 'win32' ? '\r\n' : '\n';
};
