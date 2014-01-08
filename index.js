var FS = require('fs')
  , PATH = require('path')

  , Promise = require('iou').Promise

  , slice = Array.prototype.slice


function FilePath(path) {
  this.path = path;
};
exports.FilePath = FilePath;

FilePath.prototype = {

  resolve: function resolve(to) {
    var p
    if (typeof to === 'string') {
      p = PATH.resolve(this.path, to);
    } else {
      p = PATH.resolve(this.path);
    }
    return FilePath.create(p);
  },

  append: function append() {
    // Join an arbitrary number of arguments.
    var args = [this.path].concat(slice.call(arguments))
    return FilePath.create.apply(null, args);
  },

  split: function slice() {
    return this.path.split(PATH.sep).filter(FilePath.partsFilter);
  },

  basename: function basename(ext) {
    var p = PATH.basename(this.path, ext);
    return FilePath.create(p);
  },

  extname: function extname() {
    return PATH.extname(this.path);
  },

  dirname: function dirname() {
    var p = PATH.dirname(this.path);
    return FilePath.create(p);
  },

  exists: function exists() {
    return FS.existsSync(this.path) ? true : false;
  },

  isFile: function isFile() {
    try {
      var stats = FS.statSync(this.path);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    }
    return !!stats.isFile();
  },

  isDirectory: function isDirectory() {
    try {
      var stats = FS.statSync(this.path);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    }
    return !!stats.isDirectory();
  },

  newReadStream: function newReadStream(opts) {
    return FS.createReadStream(this.path, opts);
  },

  newWriteStream: function newWriteStream(opts) {
    opts = opts || (opts || {});
    if (opts.encoding === void 0) {
      opts.encoding = 'utf8';
    }
    return FS.createWriteStream(this.path, opts);
  },

  read: function read(opts) {
    opts = (opts || Object.create(null));

    var self = this
      , promise

    if (opts.encoding === void 0) {
      opts.encoding = 'utf8';
    }

    promise = new Promise(function (resolve, reject) {
      FS.readFile(self.path, opts, function (err, data) {
        var e

        if (err && err.code === 'ENOENT') {
          return resolve(null);
        } else if (err && err.code === 'EISDIR') {
          e = new Error("Cannot read '"+ self.path +"'; it is a directory.");
          e.code = "PATH_IS_DIRECTORY";
          return reject(e);
        } else if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });

    return promise;
  },

  write: function write(data, opts) {
    opts = (opts || Object.create(null));

    var self = this
      , promise
      , dir = this.dirname()

    if (!dir.exists()) {
      dir.mkdir();
    }

    promise = new Promise(function (resolve, reject) {
      FS.writeFile(self.path, data, opts, function (err) {
        var e

        if (err && err.code === 'ENOENT') {
          return resolve(null);
        } else if (err && err.code === 'EISDIR') {
          e = new Error("Cannot write to '"+ self.path +"'; it is a directory.");
          e.code = "PATH_IS_DIRECTORY";
          return reject(e);
        } else if (err) {
          return reject(err);
        }

        return resolve(self);
      });
    });

    return promise;
  },

  copy: function copy() {
    var target = FilePath.create.apply(null, arguments)

    function copyContents(contents) {
      return target.write(contents, {encoding: null});
    }


    return this.read({encoding: null}).then(copyContents);
  },

  list: function list() {
    try {
      var list = FS.readdirSync(this.path);
    } catch (err) {
      var e;
      if (err.code === 'ENOTDIR') {
        e = new Error("Cannot list '"+ this.path +"'; it is a file.");
        e.code = "PATH_IS_FILE";
      } else if (err.code === 'ENOENT') {
        e = new Error("Cannot list '"+ this.path +"'; it does not exist.");
        e.code = "PATH_NO_EXIST";
      }

      if (e) throw e;
      throw err;
    }

    return list.map(function (item) {
      return FilePath.create(this.path, item);
    }, this);
  },

  mkdir: function mkdir() {
    var _this = this
      , parts = this.resolve().toString().split(PATH.sep)
      , fullpath

    // Shift off the empty string.
    parts.shift();

    fullpath = parts.reduce(function (fullpath, part) {
      fullpath = fullpath.append(part);
      if (fullpath.exists()) {
        if (fullpath.isDirectory()) return fullpath;
        var e = new Error("Cannot create directory '"+ _this.path +"'; it is a file.");
        e.code = "PATH_IS_FILE";
        throw e;
      }

      FS.mkdirSync(fullpath.toString());
      return fullpath;
    }, exports.root());

    return FilePath.create(fullpath);
  },

  recurse: function recurse(callback) {
    var p = this.resolve();

    if (!p.isDirectory()) {
      return callback(p);
    }

    try {
      var listing = p.list();
    } catch (err) {
      if (err.code === 'PATH_IS_FILE') {
        return p;
      }

      throw err;
    }

    listing.sort(FilePath.alphaSort).forEach(function (li) {
      callback(li);
      if (li.isDirectory()) {
        li.recurse(callback);
      }
    });

    return this;
  },

  toString: function toString() {
    return this.path;
  }
};

FilePath.create = function create() {
  var path, args

  if (arguments.length === 1) {
    path = arguments[0];
  } else if (arguments.length < 1) {
    path = process.cwd();
  } else {
    args = slice.call(arguments).map(function (item) {
      if (item == void 0) return '';
      return item +'';
    }).filter(FilePath.partsFilter);

    if (args.length < 1) {
      path = process.cwd();
    } else {
      path = PATH.join.apply(PATH, args);
    }
  }

  return new FilePath(path.toString());
};

FilePath.root = function root() {
  return FilePath.create('/');
};

FilePath.home = function home() {
  // This module is not really Windows ready, but this is how it might be
  // done.
  var path = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME
  return FilePath.create(path);
};

FilePath.alphaSort = function alphaSort(a, b) {
  a = a.toString();
  b = b.toString();
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

FilePath.partsFilter = function partsFilter(part) {
  return part ? true : false;
};


exports.newPath = FilePath.create;
exports.root = FilePath.root;
exports.home = FilePath.home;
