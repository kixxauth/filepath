var ASSERT = require('assert')
	, FILEPATH = require('./index')

var tests = [];


tests.push(function (done) {
	// Create a new file path.

	var path = FILEPATH.newPath('foo');

	equal(path.toString(), 'foo', '.toString()');

	// Multiple path parts.
	path = FILEPATH.newPath('foo', 'bar', 'baz');
	equal(path.toString(), 'foo/bar/baz', '.newPath(foo, bar, baz)');

	// With a path object.
	path = FILEPATH.newPath(FILEPATH.newPath('foo'));
	equal(path.toString(), 'foo', 'path object .toString()');

	// Multiple path objects.
	path = FILEPATH.newPath(FILEPATH.newPath('foo'), 'bar', FILEPATH.newPath('baz'));
	equal(path.toString(), 'foo/bar/baz', 'path objects .newPath(foo, bar, baz)');

	return done();
});

tests.push(function (done) {
	// .append() method.

	var p1 = FILEPATH.newPath('foo');

	var p2 = p1.append('bar');
	// Internal state is not changed.
	equal(p1.toString(), 'foo', '.append(bar)');

	// A new path object has been created.
	equal(p2.toString(), 'foo/bar', 'new .append(bar)');

	// Append multiple path parts.
	var p3 = p1.append('bar', 'baz');
	equal(p3.toString(), 'foo/bar/baz', '.append(bar, baz)');

	return done();
});

tests.push(function (done) {
	// .exists() method.

	var path = FILEPATH.newPath('foo');
	equal(path.exists(), false, 'exists() === false');

	path = FILEPATH.newPath(__filename);
	equal(path.exists(), true, 'exists() === true');

	return done();
});

tests.push(function (done) {
	// .isFile() & .isDirectory() methods.
	var path = FILEPATH.newPath(__filename);
	equal(path.isFile(), true, 'isFile() === true');
	equal(path.isDirectory(), false, 'isDirectory() === false');

	path = FILEPATH.newPath(__dirname);
	equal(path.isFile(), false, 'isFile() === false');
	equal(path.isDirectory(), true, 'isDirectory() === true');

	return done();
});

tests.push(function (done) {
	// .read() method - not found.

	var path = FILEPATH.newPath('foo')

	function onNotFound(rv) {
		equal(rv, null, 'not found rv === null');
	}

	function onFailure(err) {
		console.error(err.stack);
		process.exit(1);
	}

	path.read()
		.then(onNotFound)
		.failure(onFailure)
		.then(done)
		.failure(fail)
});

tests.push(function (done) {
	// .read() method - is directory.

	var path = FILEPATH.newPath(__dirname)

	function skip(rv) {
		console.log(rv);
		assert(false, 'should not be called');
	}

	function onFailure(err) {
		equal(err.code, "path is directory", 'Error code');
		equal(err.message, "Cannot read '"+ __dirname +"'; it is a directory.", 'Error message');
	}

	path.read()
		.then(skip)
		.failure(onFailure)
		.failure(function (err) {
			console.error(err, err.stack);
			process.exit(1);
		})
		.then(done)
		.failure(fail)
});

tests.push(function (done) {
	// .read() method - plain text.

	var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')

	function testPlainText(rv) {
		equal(rv, 'foo=bar\n', 'plain text');
	}

	function onFailure(err) {
		console.error(err.stack);
		process.exit(1);
	}

	path.read()
		.then(testPlainText)
		.failure(onFailure)
		.then(done)
		.failure(fail)
});

tests.push(function (done) {
	// .read() method - JSON.

	var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.json')

	function testJSON(rv) {
		equal(rv.foo, 'bar', 'JSON');
	}

	function onFailure(err) {
		console.error(err.stack);
		process.exit(1);
	}

	path.read({parser: 'JSON'})
		.then(testJSON)
		.failure(onFailure)
		.then(done)
		.failure(fail)
});

tests.push(function (done) {
	// .read() method - JSON w/error.

	var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')

	function skip(rv) {
		assert(false, 'should not be called');
	}

	function onFailure(err) {
		equal(err.name, 'SyntaxError');
	}

	path.read({parser: 'JSON'})
		.then(skip)
		.failure(onFailure)
		.then(done)
		.failure(fail)
});

tests.push(function (done) {
	// .read() method - ini.

	var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')

	function testIni(rv) {
		equal(rv.foo, 'bar', 'ini');
	}

	function onFailure(err) {
		console.error(err.stack);
		process.exit(1);
	}

	path.read({parser: 'ini'})
		.then(testIni)
		.failure(onFailure)
		.then(done)
		.failure(fail)
});

// Can't seem to create an ini syntax error.
/*
tests.push(function (done) {
	// .read() method - ini w/error.

	var path = FILEPATH.newPath(__dirname, 'fixtures', 'error.ini')

	function skip(rv) {
		assert(false, 'should not be called');
		return done();
	}

	function onFailure(err) {
		console.error(err.stack);
	}

	path.read({parser: 'ini'})
		.then(skip)
		.failure(onFailure)
		.then(done)
});
*/

tests.push(function (done) {
	// .list() method.
	
	var path = FILEPATH.newPath(__dirname, 'fixtures')
	var ls = path.list();

	child = ls[0];
	equal(typeof child.exists, 'function', 'child.exists()');
	equal(child.toString(), __dirname +'/fixtures/test.ini');

	// When not a directory.
	path = FILEPATH.newPath(__filename)
	try {
		path.list();
	} catch (err) {
		equal(err.code, "path is file", 'Error code');
		equal(err.message, "Cannot list '"+ __filename +"'; it is a file.", 'Error message');
	}

	return done();
});

tests.push(function (done) {
	// .home() method.

	var p1 = FILEPATH.newPath(__filename)
		, p2 = p1.home()

	notEqual(p1, p2, "p1 isnt p2");
	equal(p2.toString(), process.env.HOME, "home dir");
	return done();
});


// End of testing.
tests.push(function () { console.log('PASSED'); });


// ---


// Test vocabulary

function assert(val, msg) {
	msg = 'assert '+ val +'; '+ msg;
	return ASSERT.ok(val, msg);
}

function equal(actual, expected, msg) {
	msg = actual +' !== '+ expected +'; '+ msg;
	return ASSERT.strictEqual(actual, expected, msg);
}

function notEqual(actual, expected, msg) {
	msg = actual +' == '+ expected +'; '+ msg;
	return ASSERT.notEqual(actual, expected, msg);
}

function fail(e) {
	console.log(e.stack);
	process.exit(1);
}

// Compose test functions using continuation passing.
function asyncStack(functions) {
	var callback = functions.pop()
		, last = callback

	functions.reverse().forEach(function (fn) {
		var child = callback;
		callback = function () {
			fn(child);
		};
	});
	return callback;
}

// Run tests.
if (module === require.main) {
	asyncStack(tests)();
}
