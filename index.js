var FS = require('fs')
  , PATH = require('path')

  , IOU = require('iou')
  , INI = require('ini')

  , slice = Array.prototype.slice


exports.newPath = function newPath(path) {
    var self = Object.create(null)

    if (arguments.length > 1) {
        path = PATH.join.apply(PATH, arguments);
    }

    self.append = function append() {
        return newPath.apply(null, [path].concat(slice.call(arguments)));
    };

    self.exists = function exists() {
        return PATH.exists(path);
    };

    self.read = function read(opts) {
        var d = IOU.newDefer()
        opts || (opts = {});
        opts.encoding || (opts.encoding = 'utf8');

        FS.readFile(path, encoding, function (err, data) {
            if (err) return d.fail(err);

            switch (opts.parser) {
            case 'ini':
                return decodeINI(data);
            case 'JSON':
                return decodeJSON(data);
            default:
                return d.keep(data);
            }
        });

        return d.promise;
    };

    self.home = function home() {
        return newPath(process.platform === 'win32' ?
            process.env.USERPROFILE : process.env.HOME);
    };

    self.toString = function toString() {
        return path;
    };

    return self;
};


function decodeINI(str) {
    return INI.decode(str);
}


function decodeJSON(str) {
    return JSON.parse(str);
}
