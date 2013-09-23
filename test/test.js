var FS = require('fs')

  , FILEPATH = require('../index')


exports["Create a new FilePath object"] = {

  "with a single path part": function (test) {
    var path = FILEPATH.newPath('foo');
    test.strictEqual(path.toString(), 'foo');
    return test.done();
  },

  "with multiple path parts": function (test) {
    var path = FILEPATH.newPath('foo', 'bar', 'baz');
    test.strictEqual(path.toString(), 'foo/bar/baz');
    return test.done();
  },

  "with another FilePath object": function (test) {
    var path = FILEPATH.newPath(FILEPATH.newPath('foo'));
    test.strictEqual(path.toString(), 'foo');
    return test.done();
  },

  "with multiple FilePath objects": function (test) {
    var fp1 = FILEPATH.newPath('foo')
      , fp2 = FILEPATH.newPath('baz')
      , path = FILEPATH.newPath(fp1, 'bar', fp2)

    test.strictEqual(path.toString(), 'foo/bar/baz');
    return test.done();
  },

  "defaults to current working directory": function (test) {
    var path = FILEPATH.newPath();
    test.strictEqual(path.toString(), process.cwd());
    return test.done();
  },

  "with multiple void args": function (test) {
    var path = FILEPATH.newPath(null, undefined);
    test.strictEqual(path.toString(), process.cwd());
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
      .resolve('../test/test.js')

    test.strictEqual(path.toString(), __filename);
    return test.done();
  },

  "resolves from current directory by default": function (test) {
    var path = FILEPATH.newPath('test/test.js').resolve();
    test.strictEqual(path.toString(), __filename);
    return test.done();
  }
};

exports["#append() method"] = {
  "creates a new FilePath object": function (test) {
    var p1 = FILEPATH.newPath('foo')
      , p2 = p1.append('bar')

    // Internal state is not changed.
    test.strictEqual(p1.toString(), 'foo', 'internal state');

    // A new path object has been created.
    test.strictEqual(p2.toString(), 'foo/bar', 'new object');

    return test.done();
  },

  "can append multiple path parts": function (test) {
    var path = FILEPATH.newPath('foo').append('bar', 'baz');
    test.strictEqual(path.toString(), 'foo/bar/baz');
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

exports["#list() method"] = {
  "returns Array of FilePath objects": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures')
      , ls = path.list()
      , child = ls[0]

    test.ok(Array.isArray(ls), 'isArray')
    test.equal(typeof child.exists, 'function', 'child.exists()');
    test.equal(child.toString(), __dirname +'/fixtures/foo');
    return test.done();
  },

  "when not a directory": function (test) {
    var path = FILEPATH.newPath(__filename)
    try {
      path.list();
    } catch (err) {
      test.equal(err.code, "PATH_IS_FILE", 'Error code');
      test.equal(err.message, "Cannot list '"+ __filename +"'; it is a file.", 'Error message');
    }
    return test.done();
  },

  "when path does not exist": function (test) {
    var path = FILEPATH.newPath('foo', 'bar')
    try {
      path.list();
    } catch (err) {
      test.equal(err.code, "PATH_NO_EXIST", 'Error code');
      test.equal(err.message, "Cannot list 'foo/bar'; it does not exist.", 'Error message');
    }
    return test.done();
  }
};

exports["#mkdir() method"] = {
  tearDown: function (done) {
    // Do the cleanup.
    try {
      FS.rmdirSync('/tmp/filepath/testing/foo');
      FS.rmdirSync('/tmp/filepath/testing');
      FS.rmdirSync('/tmp/filepath');
    } catch (e) { }
    return done();
  },

  "can create a new, deep, path": function (test) {
    var path = FILEPATH.newPath('/tmp/filepath/testing/foo');

    // The path does not exist yet.
    test.strictEqual(path.exists(), false, 'exists() === false');

    path.mkdir();

    test.strictEqual(path.exists(), true, 'exists() === true');
    test.strictEqual(path.isDirectory(), true, 'isDirectory() === true');
    return test.done();
  },

  "throws if a filepath is given": function (test) {
    var path = FILEPATH.newPath(__filename)

    try {
      path.mkdir();
    } catch (e) {
      test.equal(e.code, 'PATH_IS_FILE', 'e.code');
      test.equal(e.message, "Cannot create directory '"+ path +"'; it is a file.", 'e.message');
    }

    return test.done();
  }

};

exports["#recurse() method"] = {
  "recurses deeply in to a directory tree": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures')
      , resolved = path.resolve()
      , count = 0
      , results = [
            resolved.append('foo').toString()
          , resolved.append('foo', '.gitkeep').toString()
          , resolved.append('test.ini').toString()
          , resolved.append('test.json').toString()
        ]

    test.expect(4);
    path.recurse(function (node) {
      test.equal(node.toString(), results[count], results[count]);
      count += 1;
    });

    return test.done();
  },

  "returns the file if called on a file": function (test) {
    var path = FILEPATH.newPath(__filename);
    test.expect(1);

    path.recurse(function (item) {
      test.equal(item.toString(), __filename);
    });
    return test.done();
  }
};

exports["#read() method"] = {
  "returns null when not found": function (test) {
    test.expect(1);
    var path = FILEPATH.newPath('foo')

    function whenNotFound(rv) {
      test.equal(rv, null, 'not found rv === null');
      return;
    }

    path.read()
      .then(whenNotFound, test.done)
      .then(test.done, test.done)
  },

  "throws when a path is a directory": function (test) {
    var path = FILEPATH.newPath(__dirname)

    function skip(rv) {
      console.log(rv);
      test.ok(false, 'should not be called');
    }

    test.expect(2);
    function onFailure(err) {
      test.equal(err.code, "PATH_IS_DIRECTORY", 'Error code');
      test.equal(err.message, "Cannot read '"+ __dirname +"'; it is a directory.", 'Error message');
      return;
    }

    path.read()
      .then(skip, onFailure)
      .then(test.done, test.done)
  },

  "reads plain text files": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')

    test.expect(1);
    function testPlainText(rv) {
      test.equal(rv, 'foo=bar\n', 'plain text');
      return;
    }

    path.read()
      .then(testPlainText, test.done)
      .then(test.done, test.done)
  },

  "reads and parses JSON files": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.json')

    test.expect(1);
    function testJSON(rv) {
      test.equal(rv.foo, 'bar', 'JSON');
      return;
    }

    path.read({parser: 'JSON'})
      .then(testJSON, test.done)
      .then(test.done, test.done)
  },

  "handles parse error in JSON files": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')
    test.expect(1);

    function skip(rv) {
      test.ok(false, 'should not be called');
    }

    function onFailure(err) {
      test.equal(err.name, 'SyntaxError');
    }

    path.read({parser: 'JSON'})
      .then(skip, onFailure)
      .then(test.done, test.done)
  },

  "reads and parses ini files": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')

    test.expect(1);
    function testIni(rv) {
      test.equal(rv.foo, 'bar', 'ini');
    }

    path.read({parser: 'ini'})
      .then(testIni, test.done)
      .then(test.done, test.done)
  }
};


exports[".home() class method"] = {
  "creates a FilePath object around the user's home directory": function (test) {
    var path = FILEPATH.home();
    test.equal(path.exists(), true, "home dir exists");
    test.equal(path.toString(), process.env.HOME, "home dir");
    return test.done();
  }
};

exports[".root() class method"] = {
  "creates a FilePath object around the root directory": function (test) {
    var path = FILEPATH.root()
    test.equal(path.exists(), true, "root dir exists");
    test.equal(path.toString(), '/', 'file root');
    return test.done();
  }
}
