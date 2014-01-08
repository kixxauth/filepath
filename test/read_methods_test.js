var FILEPATH = require('../index')


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
      .then(testPlainText)
      .then(test.done, test.done)
  }
};
