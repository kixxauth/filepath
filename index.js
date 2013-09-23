var FS = require('fs')
	, PATH = require('path')

	, IOU = require('iou')
	, INI = require('ini')

	, slice = Array.prototype.slice

	, options = Object.create(null)


exports.setOptions = function setOptions(opts) {
	options.serializers = opts.serializers || Object.create(null);
	return;
};

exports.newPath = function newPath(path) {
	var self = Object.create(null)
		, args = slice.call(arguments).map(function (item) {
			if (item == void 0) return '';
			return item +'';
		})

	if (args.length === 0 || args[args.length -1] === '') {
		path = process.cwd();
	} else if (args.length > 1) {
		path = PATH.join.apply(PATH, args);
	} else {
		path = args[0];
	}

	self.resolve = function resolve(to) {
		var p
		if (typeof to === 'string') {
			p = PATH.resolve(path, to);
		} else {
			p = PATH.resolve(path);
		}
		return exports.newPath(p);
	};

	self.append = function append() {
		// Join an arbitrary number of arguments.
		return exports.newPath.apply(null, [path].concat(slice.call(arguments)));
	};

	self.basename = function basename(ext) {
		var p = PATH.basename(path, ext);
		return exports.newPath(p);
	};

	self.extname = function extname() {
		return PATH.extname(path);
	};

	self.dirname = function dirname() {
		var p = PATH.dirname(path);
		return exports.newPath(p);
	};

	self.exists = function exists() {
		return FS.existsSync(path) ? true : false;
	};

	self.isFile = function isFile() {
		try {
			var stats = FS.statSync(path);
		} catch (err) {
			if (err.code === 'ENOENT') {
				return false;
			}
			throw err;
		}
		return !!stats.isFile();
	};

	self.isDirectory = function isDirectory() {
		try {
			var stats = FS.statSync(path);
		} catch (err) {
			if (err.code === 'ENOENT') {
				return false;
			}
			throw err;
		}
		return !!stats.isDirectory();
	};

	self.read = function read(parser) {
		var d = IOU.newDefer()

		FS.readFile(path, 'utf8', function (err, data) {
			var deserializer, msg, e

			if (err && err.code === 'ENOENT') {
				return d.keep(null);
			} else if (err && err.code === 'EISDIR') {
				e = new Error("Cannot read '"+ path +"'; it is a directory.");
				e.code = "PATH_IS_DIRECTORY";
				return d.fail(e);
			}

			// If a parser is specified, use it to deserialize the text.
			if (parser) {
				if (deserializer = getDeserializer(parser)) {
					deserializer(data, function (err, data) {
						if (err) {
							return d.fail(err);
						}
						return d.keep(data);
					});
				} else {
					e = new Error('The "'+ parser +'" deserializer is not defined.');
					e.code = "INVALID_DESERIALIZER";
					return d.fail(e);
				}
			} else {
				return d.keep(data);
			}
		});

		return d.promise;
	};

	self.list = function list() {
		try {
			var list = FS.readdirSync(path);
		} catch (err) {
			var e;
			if (err.code === 'ENOTDIR') {
				e = new Error("Cannot list '"+ path +"'; it is a file.");
				e.code = "PATH_IS_FILE";
			} else if (err.code === 'ENOENT') {
				e = new Error("Cannot list '"+ path +"'; it does not exist.");
				e.code = "PATH_NO_EXIST";
			}

			if (e) throw e;
			throw err;
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

	self.recurse = function recurse(callback) {
		var path = self.resolve();

		if (!path.isDirectory()) {
			return callback(path);
		}

		try {
			var listing = path.list();
		} catch (err) {
			if (err.code === 'PATH_IS_FILE') {
				return path;
			}

			throw err;
		}

		listing.sort(_alphaSort).forEach(function (li) {
			callback(li);
			if (li.isDirectory()) {
				li.recurse(callback);
			}
		});

		return self;
	};

	function _alphaSort(a, b) {
		a = a.toString();
		b = b.toString();
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	}

	self.toString = function toString() {
		return path;
	};

	function getDeserializer(name) {
		var deserializer = (options.serializers[name] || {}).deserialize
		if (typeof deserializer === 'function') {
			return deserializer;
		}
		return null;
	}

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
