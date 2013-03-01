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
        // Join an arbitrary number of arguments.
        return newPath.apply(null, [path].concat(slice.call(arguments)));
    };

    self.exists = function exists() {
        return FS.existsSync(path) ? true : false;
    };

    self.read = function read(opts) {
        var d = IOU.newDefer()

        // Break opts apart to make it immutable
        opts || (opts = {});
        encoding = opts.encoding || 'utf8';
        parser = opts.parser;

        FS.readFile(path, encoding, function (err, data) {
            var msg, e

            if (err && err.code === 'ENOENT') {
                return d.keep(null);
            } else if (err && err.code === 'EISDIR') {
                e = new Error("Cannot read '"+ path +"'; it is a directory.");
                e.code = "path is directory";
                return d.fail(e);
            }

            // If a parser is specified, use it to deserialize the text.
            switch (parser) {
            case 'ini':
                try {
                    return d.keep(decodeINI(data));
                } catch (iniErr) {
                    return d.fail(iniErr);
                }
            case 'JSON':
                try {
                    return d.keep(decodeJSON(data));
                } catch (jsonErr) {
                    return d.fail(jsonErr);
                }
            default:
                return d.keep(data);
            }
        });

        return d.promise;
    };

    self.home = function home() {
        // This module is not really Windows ready, but this is how it might be
        // done.
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
