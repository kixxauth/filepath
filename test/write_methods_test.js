var FS = require('fs');

var TOOLS = require('./tools');
var FILEPATH = require('../index');

exports['#.write() method'] = {
	'setUp': function (done) {
		FILEPATH.newPath('/tmp/test-write-file.txt').remove();
		FILEPATH.newPath('/tmp/test-write-file-sync.txt').remove();
		FILEPATH.newPath('/tmp/new-dir/test-write-file.txt').remove();
		FILEPATH.newPath('/tmp/new-dir/test-write-file-sync.txt').remove();
		FILEPATH.newPath('/tmp/new-dir').remove();
		return done();
	},

	'writes plain text files by default': function (test) {
		test.expect(3);
		var path = FILEPATH.newPath('/tmp/test-write-file.txt');
		test.strictEqual(path.exists(), false, 'path does not exist yet');

		function testPlainText(path) {
			test.ok(path.exists(), 'path exists');
			var rv = FS.readFileSync(path.toString(), 'utf8');
			test.equal(rv, 'foo=bar');
			return;
		}

		path.write('foo=bar')
			.then(testPlainText)
			.then(test.done, test.done);
	},

	'writes plain text files synchronously': function (test) {
		test.expect(3);
		var path = FILEPATH.newPath('/tmp/test-write-file-sync.txt');
		test.strictEqual(path.exists(), false, 'path does not exist yet');

		path.write('foo=bar', {sync: true});
		test.ok(path.exists(), 'path exists');
		var rv = FS.readFileSync(path.toString(), 'utf8');
		test.equal(rv, 'foo=bar');
		test.done();
	},

	'creates directories if needed': function (test) {
		test.expect(3);
		var path = FILEPATH.newPath('/tmp/new-dir/test-write-file.txt');
		test.strictEqual(path.exists(), false, 'path does not exist yet');

		function testPlainText() {
			test.ok(path.exists(), 'path exists');
			var rv = FS.readFileSync(path.toString(), 'utf8');
			test.equal(rv, 'deep foo=bar');
			return;
		}

		path.write('deep foo=bar')
			.then(testPlainText)
			.then(test.done, test.done);
	},

	'creates directories if needed (sync)': function (test) {
		test.expect(3);
		var path = FILEPATH.newPath('/tmp/new-dir/test-write-file-sync.txt');
		test.strictEqual(path.exists(), false, 'path does not exist yet');

		path.write('deep foo=bar', {sync: true});
		test.ok(path.exists(), 'path exists');
		var rv = FS.readFileSync(path.toString(), 'utf8');
		test.equal(rv, 'deep foo=bar');
		test.done();
	},

	'rejects when a path is a directory': function (test) {
		var path = FILEPATH.newPath(__dirname);

		function skip(rv) {
			console.log(rv);
			test.ok(false, 'should not be called');
			return;
		}

		test.expect(5);
		function onFailure(err) {
			test.ok(err instanceof FILEPATH.ExpectFileError, 'instanceof ExpectFileError');
			test.equal(err.name, 'ExpectFileError', 'Error name');
			test.equal(err.code, 'PATH_IS_DIRECTORY', 'Error code');
			test.ok(/^Cannot write to/.test(err.message), 'Error message');
			test.ok(/it is a directory.$/.test(err.message), 'Error message');
			return;
		}

		path.write()
			.then(skip)
			.catch(onFailure)
			.then(test.done);
	},

	'throws when a path is a directory (sync)': function (test) {
		var path = FILEPATH.newPath(__dirname);

		test.expect(5);
		try {
			path.write('', {sync: true});
		} catch (err) {
			test.ok(err instanceof FILEPATH.ExpectFileError, 'instanceof ExpectFileError');
			test.equal(err.name, 'ExpectFileError', 'Error name');
			test.equal(err.code, 'PATH_IS_DIRECTORY', 'Error code');
			test.ok(/^Cannot write to/.test(err.message), 'Error message');
			test.ok(/it is a directory.$/.test(err.message), 'Error message');
		}

		test.done();
	}
};

exports['#copy() method'] = {
	'setUp': function (done) {
		FILEPATH.newPath('/tmp/copied-test.ini').remove();
		FILEPATH.newPath('/tmp/copied-test-sync.ini').remove();
		return done();
	},

	'copies to target path': function (test) {
		test.expect(4);
		var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini');
		var target = FILEPATH.root().append('tmp', 'copied-test.ini');

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

	'copies to target path synchronously': function (test) {
		test.expect(4);
		var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini');
		var target = FILEPATH.root().append('tmp', 'copied-test-sync.ini');

		test.strictEqual(target.exists(), false, 'path does not exist yet');

		path.copy(target, {sync: true});
		test.strictEqual(target.toString(), TOOLS.platformString('/tmp/copied-test-sync.ini'));
		test.ok(target.exists());
		var content = target.read({sync: true});
		test.strictEqual(content, TOOLS.platformLines('foo=bar\n'));
		test.done();
	}
};
