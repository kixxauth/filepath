var FS   = require('fs')
  , PATH = require('path')

  , TOOLS    = require('./tools')
  , FILEPATH = require('../index')


exports["#list() method"] = {
  "returns Array of FilePath objects": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures')
      , ls = path.list()
      , child = ls[0]

    test.ok(Array.isArray(ls), 'isArray')
    test.equal(typeof child.exists, 'function', 'child.exists()');
    test.equal(child.toString(), __dirname + PATH.sep +'fixtures'+ PATH.sep +'foo');
    return test.done();
  },

  "when not a directory": function (test) {
    var path = FILEPATH.newPath(__filename)
    try {
      path.list();
    } catch (err) {
      test.equal(err.name, 'FilePathError', 'FilePathError');
      test.equal(err.code, "PATH_IS_FILE", 'FilePathError code');
      test.equal(err.message, "Cannot list '"+ __filename +"'; it is a file.", 'FilePathError message');
    }
    return test.done();
  },

  "when path does not exist": function (test) {
    var path = FILEPATH.newPath('foo', 'bar')
    try {
      path.list();
    } catch (err) {
      test.equal(err.name, 'FilePathError', 'FilePathError');
      test.equal(err.code, "PATH_NO_EXIST", 'FilePathError code');
      test.equal(err.message, "Cannot list '"+ TOOLS.platformString('foo/bar') +"'; it does not exist.", 'FilePathError message');
    }
    return test.done();
  }
};

exports["#mkdir() method"] = {
  setUp: function (done) {
    // Do the cleanup.
    try {
      FS.rmdirSync(TOOLS.platformString('/tmp/filepath/testing/foo'));
    } catch (e) { }

    try {
      FS.rmdirSync(TOOLS.platformString('/tmp/filepath/testing'));
    } catch (e) { }

    try {
      FS.rmdirSync(TOOLS.platformString('/tmp/filepath'));
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
      test.equal(e.name, 'FilePathError', 'FilePathError');
      test.equal(e.code, 'PATH_IS_FILE', 'FilePathError code');
      test.equal(e.message, "Cannot create directory '"+ path +"'; it is a file.", 'FilePathError message');
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
          , resolved.append('js_module.js').toString()
          , resolved.append('test.ini').toString()
          , resolved.append('test.json').toString()
        ]

    test.expect(5);
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
