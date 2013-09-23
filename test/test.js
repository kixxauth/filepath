var FS = require('fs')

  , FILEPATH = require('../index')


exports["MODULE.setOptions"] = {
  "cannot be called more than once": function (test) {
    var serializers = {
      'json': {
        deserialize: function (text, callback) {
          return callback(null, JSON.parse(text));
        },

        serialize: function (object, callback) {
          return callback(null, JSON.stringify(object));
        }
      }
    };

    FILEPATH.setOptions({serializers: serializers});

    test.throws(function () {
      FILEPATH.setOptions()
    }, "FilePath .setOptions() should only be called once.");
    return test.done();
  }
};

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

exports["#slice() method"] = {
  "slices a FilePath into an Array of strings": function (test) {
    var path = FILEPATH.newPath('/foo/bar/baz/test.json')
      , parts = path.slice()

    test.ok(Array.isArray(parts), 'Array.isArray()');
    test.equal(parts.pop(), 'test.json', '.pop()');
    return test.done();
  },

  "filters out empty path parts": function (test) {
    var path = FILEPATH.newPath('/foo//bar/baz/')
      , parts = path.slice()

    console.log(parts)
    test.equal(parts.length, 3, 'length');
    test.equal(parts.shift(), 'foo', '.shift()');
    test.equal(parts.pop(), 'baz', '.pop()');
    return test.done();
  }
}

exports["#basename() method"] = {
  "creates a new FilePath object": function (test) {
    var path = FILEPATH.newPath(__filename)
      , path2 = path.basename()

    test.notEqual(path, path2);
    return test.done();
  },

  "returns the basename of the path": function (test) {
    var path = FILEPATH.newPath(__filename).basename()
    test.equal(path.toString(), 'test.js');
    return test.done();
  },

  "can slice off the extension": function (test) {
    var path = FILEPATH.newPath(__filename).basename('.js')
    test.equal(path.toString(), 'test');
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
  setUp: function (done) {
    // Do the cleanup.
    try {
      FS.rmdirSync('/tmp/filepath/testing/foo');
    } catch (e) { }

    try {
      FS.rmdirSync('/tmp/filepath/testing');
    } catch (e) { }

    try {
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
      return;
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

  "reads plain text files by default": function (test) {
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

  "calls optional deserialization function": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.json');

    test.expect(1);
    function testParser(rv) {
      test.equal(rv.foo, 'bar');
      return;
    }

    path.read({parser: 'json'})
      .then(testParser, test.done)
      .then(test.done, test.done)
  },

  "fails when a parser is specified but the deserializer is not defined": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.json');
    test.expect(1);

    function skip(rv) {
      console.log(rv);
      test.ok(false, 'skip should not be called');
      return;
    }

    function testFailure(err) {
      test.equal(err.code, 'INVALID_DESERIALIZER', 'Error.code');
      return;
    }

    path.read({parser: 'yaml'})
      .then(skip, testFailure)
      .then(test.done, test.done)
  }
};

exports["#.write() method"] = {
  setUp: function (done) {
    // Do the cleanup.
    try {
      FS.unlinkSync('/tmp/test-write-file.txt');
    } catch (e) { }

    try {
      FS.unlinkSync('/tmp/test-write-file.json');
    } catch (e) { }

    try {
      FS.unlinkSync('/tmp/new-dir/test-write-file.txt');
    } catch (e) { }

    return done();
  },

  "writes plain text files by default": function (test) {
    test.expect(3);
    var path = FILEPATH.newPath('/tmp/test-write-file.txt')
    test.strictEqual(path.exists(), false, 'path does not exist yet');

    function testPlainText() {
      test.ok(path.exists(), 'path exists');
      var rv = FS.readFileSync(path.toString(), 'utf8');
      test.equal(rv, 'foo=bar');
      return;
    }

    path.write("foo=bar")
      .then(testPlainText, test.done)
      .then(test.done, test.done)
  },

  "creates directories if needed": function (test) {
    test.expect(3);
    var path = FILEPATH.newPath('/tmp/new-dir/test-write-file.txt')
    test.strictEqual(path.exists(), false, 'path does not exist yet');

    function testPlainText() {
      test.ok(path.exists(), 'path exists');
      var rv = FS.readFileSync(path.toString(), 'utf8');
      test.equal(rv, 'deep foo=bar');
      return;
    }

    path.write("deep foo=bar")
      .then(testPlainText, test.done)
      .then(test.done, test.done)
  },

  "throws when a path is a directory": function (test) {
    var path = FILEPATH.newPath(__dirname)

    function skip(rv) {
      console.log(rv);
      test.ok(false, 'should not be called');
      return;
    }

    test.expect(2);
    function onFailure(err) {
      test.equal(err.code, "PATH_IS_DIRECTORY", 'Error code');
      test.equal(err.message, "Cannot write to '"+ __dirname +"'; it is a directory.", 'Error message');
      return;
    }

    path.write()
      .then(skip, onFailure)
      .then(test.done, test.done)
  },

  "calls optional serialization function": function (test) {
    test.expect(3);
    var path = FILEPATH.newPath('/tmp/test-write-file.json');
    test.strictEqual(path.exists(), false, 'path does not exist yet');

    function testParser(rv) {
      test.ok(path.exists(), 'path exists');
      var rv = FS.readFileSync(path.toString(), 'utf8');
      test.equal(rv, '{"foo":"bar"}');
      return;
    }

    path.write({foo: 'bar'}, {parser: 'json'})
      .then(testParser, test.done)
      .then(test.done, test.done)
  },

  "fails when a parser is specified but the serializer is not defined": function (test) {
    var path = FILEPATH.newPath('/tmp/test-write-file.json');
    test.expect(1);

    function skip(rv) {
      console.log(rv);
      test.ok(false, 'skip should not be called');
      return;
    }

    function testFailure(err) {
      test.equal(err.code, 'INVALID_SERIALIZER', 'Error.code');
      return;
    }

    path.write({foo: 'bar'}, {parser: 'yaml'})
      .then(skip, testFailure)
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
