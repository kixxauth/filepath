var FS = require('fs')

  , FILEPATH = require('../index')


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

    function testPlainText(path) {
      test.ok(path.exists(), 'path exists');
      var rv = FS.readFileSync(path.toString(), 'utf8');
      test.equal(rv, 'foo=bar');
      return;
    }

    path.write("foo=bar")
      .then(testPlainText)
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
      .then(testPlainText)
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
      .then(testParser)
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

exports["#copy() method"] = {

  "copies to target path": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')

    test.expect(3);

    function withNewPath(target) {
      test.strictEqual(target.toString(), '/tmp/copied-test.ini');
      test.ok(target.exists());
      return target.read().then(testContent);
    }

    function testContent(content) {
      test.strictEqual(content, 'foo=bar\n');
      return test.done();
    }

    path.copy(FILEPATH.root().append('tmp', 'copied-test.ini'))
      .then(withNewPath).catch(test.done);
  }
};
