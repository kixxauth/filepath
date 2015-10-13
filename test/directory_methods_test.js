var FS = require('fs');
var PATH = require('path');
var TOOLS = require('./tools');
var FILEPATH = require('../index');

exports['#list() method'] = {
	'returns Array of FilePath objects': function (test) {
		var path = FILEPATH.newPath(__dirname, 'fixtures');
		var ls = path.list();
		var child = ls[0];

		test.ok(Array.isArray(ls), 'isArray');
		test.equal(typeof child.exists, 'function', 'child.exists()');
		test.equal(child.toString(), PATH.join(__dirname, 'fixtures', 'foo'));
		return test.done();
	},

	'when not a directory': function (test) {
		var path = FILEPATH.newPath(__filename);
		try {
			path.list();
		} catch (err) {
			test.equal(err.name, 'FilePathError', 'FilePathError');
			test.equal(err.code, 'PATH_IS_FILE', 'FilePathError code');
			test.ok(/Cannot list ([.]+) it is a file/.test(err.message), 'FilePathError message');
		}
		return test.done();
	},

	'when path does not exist': function (test) {
		var path = FILEPATH.newPath('foo', 'bar');
		try {
			path.list();
		} catch (err) {
			test.equal(err.name, 'FilePathError', 'FilePathError');
			test.equal(err.code, 'PATH_NO_EXIST', 'FilePathError code');
			test.ok(/Cannot list ([.]+) it does not exist/.test(err.message), 'FilePathError message');
		}
		return test.done();
	}
};

exports['#mkdir() method'] = {
	'setUp': function (done) {
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

	'can create a new, deep, path': function (test) {
		var path = FILEPATH.newPath('/tmp/filepath/testing/foo');

		// The path does not exist yet.
		test.strictEqual(path.exists(), false, 'exists() === false');

		path.mkdir();

		test.strictEqual(path.exists(), true, 'exists() === true');
		test.strictEqual(path.isDirectory(), true, 'isDirectory() === true');
		return test.done();
	},

	'throws if a filepath is given': function (test) {
		var path = FILEPATH.newPath(__filename);

		try {
			path.mkdir();
		} catch (err) {
			test.equal(err.name, 'FilePathError', 'FilePathError');
			test.equal(err.code, 'PATH_IS_FILE', 'FilePathError code');
			test.ok(/Cannot list ([.]+) it is a file/.test(err.message), 'FilePathError message');
		}

		return test.done();
	}

};

exports['#recurse() method'] = {
	'recurses deeply in to a directory tree': function (test) {
		var path = FILEPATH.newPath(__dirname, 'fixtures');
		var resolved = path.resolve();
		var count = 0;
		var results = [
			resolved.append('foo').toString(),
			resolved.append('foo', '.gitkeep').toString(),
			resolved.append('js_module.js').toString(),
			resolved.append('test.ini').toString(),
			resolved.append('test.json').toString()
		];

		test.expect(5);
		path.recurse(function (node) {
			test.equal(node.toString(), results[count], results[count]);
			count += 1;
		});

		return test.done();
	},

	'returns the file if called on a file': function (test) {
		var path = FILEPATH.newPath(__filename);
		test.expect(1);

		path.recurse(function (item) {
			test.equal(item.toString(), __filename);
		});
		return test.done();
	}
};
