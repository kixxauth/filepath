var FILEPATH = require('../index')
  , TOOLS    = require('./tools')


exports["#split() method"] = {
  "slices a FilePath into an Array of strings": function (test) {
    var path = FILEPATH.newPath('/foo/bar/baz/test.json')
      , parts = path.split()

    test.ok(Array.isArray(parts), 'Array.isArray()');
    test.equal(parts.pop(), 'test.json', '.pop()');
    return test.done();
  },

  "filters out empty path parts": function (test) {
    var path = FILEPATH.newPath('/foo//bar/baz/')
      , parts = path.split()

    if (process.platform === 'win32') {
      // shift off the 'C:'
      parts.shift();
    }

    test.equal(parts.length, 3, 'length');
    test.equal(parts.shift(), 'foo', '.shift()');
    test.equal(parts.pop(), 'baz', '.pop()');
    return test.done();
  }
}

exports["#basename() method"] = {
  "returns the basename of the path": function (test) {
    var path = FILEPATH.newPath(__filename).basename()
    test.equal(path, 'common_methods_test.js');
    return test.done();
  },

  "can slice off the extension": function (test) {
    var path = FILEPATH.newPath(__filename).basename('.js')
    test.equal(path, 'common_methods_test');
    return test.done();
  }
};

exports["#extname() method"] = {
  "returns the file extension as a String": function (test) {
    var path = FILEPATH.newPath(__filename)
    test.equal(path.extname(), '.js');
    return test.done();
  }
};

exports["#dirname() method"] = {
  "creates a new FilePath object": function (test) {
    var path = FILEPATH.newPath(__filename)
      , path2 = path.dirname()

    test.notEqual(path, path2);
    return test.done();
  },

  "returns the directory name of the path": function (test) {
    var path = FILEPATH.newPath(__filename).dirname()
    test.equal(path.toString(), __dirname);
    return test.done();
  }
};

exports["#resolve() method"] = {
  "creates a new FilePath object": function (test) {
    var path = FILEPATH.newPath()
      , path2 = path.resolve()

    test.notEqual(path, path2);
    return test.done();
  },

  "resolves from dots": function (test) {
    var path = FILEPATH
      .newPath(__dirname, '../', 'node_modules')
      .resolve('../test/common_methods_test.js')

    test.strictEqual(path.toString(), __filename);
    return test.done();
  },

  "resolves from current directory by default": function (test) {
    var path = FILEPATH.newPath('test/common_methods_test.js').resolve();
    test.strictEqual(path.toString(), __filename);
    return test.done();
  }
};

exports["#append() method"] = {
  "creates a new FilePath object": function (test) {
    var p1 = FILEPATH.newPath('foo')
      , p2 = p1.append('bar')

    // Internal state is not changed.
    test.strictEqual(p1.toString(), TOOLS.platformString('foo'), 'internal state');

    // A new path object has been created.
    test.strictEqual(p2.toString(), TOOLS.platformString('foo/bar'), 'new object');

    return test.done();
  },

  "can append multiple path parts": function (test) {
    var path = FILEPATH.newPath('foo').append('bar', 'baz');
    test.strictEqual(path.toString(), TOOLS.platformString('foo/bar/baz'));
    return test.done();
  }
};

exports["#exists() method"] = {
  "when path exists": function (test) {
    var path = FILEPATH.newPath('foo');
    test.strictEqual(path.exists(), false);
    return test.done();
  },

  "when path does not exist": function (test) {
    var path = FILEPATH.newPath(__filename);
    test.strictEqual(path.exists(), true);
    return test.done();
  }
};

exports["#isFile() method"] = {
  "when path is a file": function (test) {
    var path = FILEPATH.newPath(__filename);
    test.strictEqual(path.isFile(), true);
    return test.done();
  },

  "when path is not a file": function (test) {
    var path = FILEPATH.newPath(__dirname);
    test.strictEqual(path.isFile(), false);
    return test.done();
  },

  "when a path does not exist": function (test) {
    var path = FILEPATH.newPath('foo');
    test.strictEqual(path.isFile(), false);
    return test.done();
  }
};

exports["#isDirectory() method"] = {
  "when a path is a directory": function (test) {
    var path = FILEPATH.newPath(__dirname);
    test.strictEqual(path.isDirectory(), true);
    return test.done();
  },

  "when a path is not a directory": function (test) {
    var path = FILEPATH.newPath(__filename);
    test.strictEqual(path.isDirectory(), false);
    return test.done();
  },

  "when a path does not exist": function (test) {
    var path = FILEPATH.newPath('foo');
    test.strictEqual(path.isDirectory(), false);
    return test.done();
  }
};
