var FS       = require('fs')

  , TOOLS    = require('./tools')
  , FILEPATH = require('../index')


exports["#.write() method"] = {
  setUp: function (done) {
    // Do the cleanup.
    try {
      FS.unlinkSync(TOOLS.platformString('/tmp/test-write-file.txt'));
    } catch (e) { }
    try {
      FS.unlinkSync(TOOLS.platformString('/tmp/test-write-file-sync.txt'));
    } catch (e) { }
    try {
      FS.unlinkSync(TOOLS.platformString('/tmp/new-dir/test-write-file.txt'));
    } catch (e) { }
    try {
      FS.unlinkSync(TOOLS.platformString('/tmp/new-dir/test-write-file-sync.txt'));
    } catch (e) { }
    try {
      FS.rmdirSync(TOOLS.platformString('/tmp/new-dir'));
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

  "writes plain text files synchronously": function (test) {
    test.expect(3);
    var path = FILEPATH.newPath('/tmp/test-write-file-sync.txt')
    test.strictEqual(path.exists(), false, 'path does not exist yet');

    path.write("foo=bar", {sync: true});
    test.ok(path.exists(), 'path exists');
    var rv = FS.readFileSync(path.toString(), 'utf8');
    test.equal(rv, 'foo=bar');
    test.done();
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

  "creates directories if needed": function (test) {
    test.expect(3);
    var path = FILEPATH.newPath('/tmp/new-dir/test-write-file-sync.txt')
    test.strictEqual(path.exists(), false, 'path does not exist yet');

    path.write("deep foo=bar", {sync: true});
    test.ok(path.exists(), 'path exists');
    var rv = FS.readFileSync(path.toString(), 'utf8');
    test.equal(rv, 'deep foo=bar');
    test.done();
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

  "throws when a path is a directory": function (test) {
    var path = FILEPATH.newPath(__dirname)

    test.expect(2);

    try {
      path.write('', {sync: true});
    } catch (err) {
      test.equal(err.code, "PATH_IS_DIRECTORY", 'Error code');
      test.equal(err.message, "Cannot write to '"+ __dirname +"'; it is a directory.", 'Error message');
    }

    test.done();
  }
};

exports["#copy() method"] = {
  setUp: function (done) {
    // Do the cleanup.
    try {
      FS.unlinkSync(TOOLS.platformString('/tmp/copied-test.ini'));
    } catch (e) { }
    try {
      FS.unlinkSync(TOOLS.platformString('/tmp/copied-test-sync.ini'));
    } catch (e) { }

    return done();
  },


  "copies to target path": function (test) {
    test.expect(4);
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')
      , target = FILEPATH.root().append('tmp', 'copied-test.ini')

    test.strictEqual(target.exists(), false, 'path does not exist yet');

    function withNewPath(target) {
      test.strictEqual(target.toString(), TOOLS.platformString('/tmp/copied-test.ini'));
      test.ok(target.exists());
      return target.read().then(testContent);
    }

    function testContent(content) {
      test.strictEqual(content, TOOLS.platformLines('foo=bar\n'));
      return test.done();
    }

    path.copy(target)
      .then(withNewPath)
      .catch(test.done);
  },

  "copies to target path synchronously": function (test) {
    test.expect(4);
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')
      , target = FILEPATH.root().append('tmp', 'copied-test-sync.ini')

    test.strictEqual(target.exists(), false, 'path does not exist yet');

    path.copy(target, {sync: true});
    test.strictEqual(target.toString(), TOOLS.platformString('/tmp/copied-test-sync.ini'));
    test.ok(target.exists());
    var content = target.read({sync: true});
    test.strictEqual(content, TOOLS.platformLines('foo=bar\n'));
    test.done();
  }
};
