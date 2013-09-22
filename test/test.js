var FILEPATH = require('../index');

exports["Create a new FilePath object"] = function (test) {

  var path = FILEPATH.newPath('foo');

  test.strictEqual(path.toString(), 'foo', '.toString()');

  // Multiple path parts.
  path = FILEPATH.newPath('foo', 'bar', 'baz');
  test.strictEqual(path.toString(), 'foo/bar/baz', '.newPath(foo, bar, baz)');

  // With a path object.
  path = FILEPATH.newPath(FILEPATH.newPath('foo'));
  test.strictEqual(path.toString(), 'foo', 'path object .toString()');

  // Multiple path objects.
  path = FILEPATH.newPath(FILEPATH.newPath('foo'), 'bar', FILEPATH.newPath('baz'));
  test.strictEqual(path.toString(), 'foo/bar/baz', 'path objects .newPath(foo, bar, baz)');

  // Defaults to CWD
  path = FILEPATH.newPath();
  test.strictEqual(path.toString(), process.cwd(), 'default to cwd');

  // Multiple void arguments
  path = FILEPATH.newPath(null, undefined);
  test.strictEqual(path.toString(), process.cwd(), 'undefined to cwd');

  return test.done();
};