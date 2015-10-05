var FILEPATH = require('../index')
  , TOOLS    = require('./tools')


exports["#read() method"] = {
  "returns null when not found": function (test) {
    test.expect(1);
    var path = FILEPATH.newPath('foo')

    function whenNotFound(rv) {
      test.equal(rv, null, 'not found rv === null');
      return;
    }

    path.read()
      .then(whenNotFound)
      .then(test.done, test.done)
  },

  "throws when a path is a directory": function (test) {
    var path = FILEPATH.newPath(__dirname)

    function skip(rv) {
      console.log(rv);
      test.ok(false, 'should not be called');
      return;
    }

    test.expect(3);
    function onFailure(err) {
      test.equal(err.name, "FilePathError", 'FilePathError');
      test.equal(err.code, "PATH_IS_DIRECTORY", 'FilePathError code');
      test.equal(err.message, "Cannot read '"+ __dirname +"'; it is a directory.", 'FilePathError message');
      return;
    }

    path.read()
      .then(skip, onFailure)
      .then(test.done, test.done)
  },

  "reads plain text files by default": function (test) {
    test.expect(1);

    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')

    function testPlainText(rv) {
      test.equal(rv, TOOLS.platformLines('foo=bar\n'), 'plain text');
      return;
    }

    path.read()
      .then(testPlainText)
      .then(test.done, test.done)
  },

  "optionally reads files synchronously": function (test) {
    test.expect(1);

    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')

    var rv = path.read({sync: true})
    test.equal(rv, TOOLS.platformLines('foo=bar\n'), 'synchronous read');
    test.done()
  },

  "synchronously returns null when not found": function (test) {
    test.expect(1);
    var path = FILEPATH.newPath('foo')

    var rv = path.read({sync: true})
    test.equal(rv, null, 'sync not found rv === null')
    test.done()
  },

  "synchronously throws when a path is a directory": function (test) {
    test.expect(3);
    var path = FILEPATH.newPath(__dirname)

    try {
      path.read({sync: true});
    } catch (err) {
      test.equal(err.name, 'FilePathError', 'sync FilePathError')
      test.equal(err.code, "PATH_IS_DIRECTORY", 'sync FilePathError code');
      test.equal(err.message, "Cannot read '"+ __dirname +"'; it is a directory.", 'sync FilePathError message');
    }

    test.done();
  }
};
