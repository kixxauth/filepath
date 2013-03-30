var FS = require('fs')
	, PATH = require('path')

	, IOU = require('iou')
	, INI = require('ini')

	, slice = Array.prototype.slice


exports.newPath = function newPath(path) {
	var self = Object.create(null)
		, args = slice.call(arguments).map(function (item) {
			return item +'';
		})

	if (args.length > 1) {
		path = PATH.join.apply(PATH, args);
	} else {
		path = args[0] || process.cwd();
	}

	self.resolve = function resolve(to) {
		return exports.newPath(PATH.resolve(path, to));
	};

	self.append = function append() {
		// Join an arbitrary number of arguments.
		return exports.newPath.apply(null, [path].concat(slice.call(arguments)));
	};

	self.exists = function exists() {
		return FS.existsSync(path) ? true : false;
	};

	self.isFile = function isFile() {
		var stats = FS.statSync(path);
		return !!stats.isFile();
	};

	self.isDirectory = function isDirectory() {
		var stats = FS.statSync(path);
		return !!stats.isDirectory();
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
				e.code = "PATH_IS_DIRECTORY";
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

	self.list = function list() {
		try {
			var list = FS.readdirSync(path);
		} catch (err) {
			if (err.code) {
				var e = new Error("Cannot list '"+ path +"'; it is a file.");
				e.code = "PATH_IS_FILE";
				throw e;
			}
		}

		return list.map(function (item) {
			return exports.newPath(path, item);
		});
	};

	self.mkdir = function mkdir() {
		var parts = self.resolve().toString().split(PATH.sep)
			, fullpath

		// Shift off the empty string.
		parts.shift();

		fullpath = parts.reduce(function (fullpath, part) {
			fullpath = fullpath.append(part);
			if (fullpath.exists()) {
				if (fullpath.isDirectory()) return fullpath;
				var e = new Error("Cannot create directory '"+ path +"'; it is a file.");
				e.code = "PATH_IS_FILE";
				throw e;
			}

			FS.mkdirSync(fullpath.toString());
			return fullpath;
		}, exports.root());

		return exports.newPath(fullpath);
	};

	self.toString = function toString() {
		return path;
	};

	return self;
};

exports.root = function root() {
	return exports.newPath('/');
};

exports.home = function home() {
	// This module is not really Windows ready, but this is how it might be
	// done.
	return exports.newPath(process.platform === 'win32' ?
		process.env.USERPROFILE : process.env.HOME);
};


function decodeINI(str) {
	return INI.decode(str);
}


function decodeJSON(str) {
	return JSON.parse(str);
}
