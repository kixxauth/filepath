var FILEPATH = require('../index');

exports['#require() method'] = {
	'require a module': function (test) {
		test.expect(1);
		var path = FILEPATH.newPath(__dirname, 'fixtures', 'js_module.js');
		test.ok(path.exists(), 'This path exists.');
		path.require(require);
		return test.done();
	},

	'require a module without contextual require': function (test) {
		test.expect(4);
		var path = FILEPATH.newPath(__dirname, 'fixtures', 'js_module.js');
		try {
			path.require({});
		} catch (err) {
			// This is a programmer error, non operational, so we use a plain
			// Error instance instead of a more specific one.
			test.ok(err instanceof Error, 'Error instanceof');
			test.equal(err.name, 'Error', 'Error name');
			test.equal(err.code, 'NO_REQUIRE_CONTEXT');
			test.equal(err.message, 'Must pass a require function to #require().');
		}
		return test.done();
	},

	'require a module that does not exist': function (test) {
		test.expect(5);
		var path = FILEPATH.newPath(__dirname, 'fixtures', 'not_found.js');
		test.strictEqual(path.exists(), false, 'This path exists.');
		try {
			path.require(require);
		} catch (err) {
			test.ok(err instanceof FILEPATH.NotFoundError, 'Error instanceof');
			test.equal(err.name, 'NotFoundError', 'Error name');
			test.equal(err.code, 'MODULE_NOT_FOUND');
			test.equal(err.message, 'Cannot find module \'' + path.toString() + '\'');
		}
		return test.done();
	}
};
