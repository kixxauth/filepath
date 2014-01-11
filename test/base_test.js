var FILEPATH = require('../index')

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

  "with undefined": function (test) {
    var path = FILEPATH.newPath(undefined);
    test.strictEqual(path.toString(), process.cwd());
    return test.done();
  },

  "with multiple void args": function (test) {
    var path = FILEPATH.newPath(null, undefined);
    test.strictEqual(path.toString(), process.cwd());
    return test.done();
  }
};


exports["extendable prototype"] = {

  "allows extending the FilePath prototype": function (test) {
    FILEPATH.FilePath.prototype.foo = function () {
      return this.append('foo');
    }

    var path = FILEPATH.newPath().foo()
      , expected = process.cwd() + '/foo'

    test.strictEqual(path.toString(), expected)
    return test.done();
  }
};
