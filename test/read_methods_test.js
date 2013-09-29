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
