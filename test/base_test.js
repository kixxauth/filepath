var FILEPATH = require('../index')
	, PATH     = require('path')
	, TOOLS    = require('./tools')


exports["Create a new FilePath object"] = {

	"with a single path part": function (test) {
		var path = FILEPATH.newPath('foo')
		test.strictEqual(path.toString(), TOOLS.platformString('foo'))
		return test.done();
	},

	"with multiple path parts": function (test) {
		var path = FILEPATH.newPath('foo', 'bar', 'baz')
		test.strictEqual(path.toString(), TOOLS.platformString('foo/bar/baz'))
		return test.done();
	},

	"with another FilePath object": function (test) {
		var path = FILEPATH.newPath(FILEPATH.newPath('foo'))
		test.strictEqual(path.toString(), TOOLS.platformString('foo'));
		return test.done();
	},

	"defaults to current working directory": function (test) {
		var path = FILEPATH.newPath()
		test.strictEqual(path.toString(), process.cwd())
		return test.done();
	},

	"with undefined": function (test) {
		var path = FILEPATH.newPath(undefined)
		test.strictEqual(path.toString(), process.cwd())
		return test.done();
	},

	"with multiple void args": function (test) {
		var path = FILEPATH.newPath(null, undefined)
		test.strictEqual(path.toString(), process.cwd())
		return test.done();
	},

	"with relative path string": function (test) {
		var path = FILEPATH.newPath('./foo')
		test.strictEqual(path.toString(), process.cwd() + PATH.sep + 'foo')
		return test.done();
	}
};


exports["extendable prototype"] = {

	"allows extending the FilePath prototype": function (test) {
		FILEPATH.FilePath.prototype.foo = function () {
			return this.append('foo');
		}

		var path = FILEPATH.newPath().foo()
			, expected = process.cwd() + PATH.sep + 'foo'

		test.strictEqual(path.toString(), expected)
		return test.done();
	}
};
