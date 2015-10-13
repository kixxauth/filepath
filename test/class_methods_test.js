var FILEPATH = require('../index');
var TOOLS = require('./tools');

exports['.home() class method'] = {
	'creates a FilePath object around the users home directory': function (test) {
		var path = FILEPATH.home();
		test.equal(path.exists(), true, 'home dir exists');
		test.equal(path.toString(), process.env.HOME, 'home dir');
		return test.done();
	}
};

exports['.root() class method'] = {
	'creates a FilePath object around the root directory': function (test) {
		var path = FILEPATH.root();
		test.equal(path.exists(), true, 'root dir exists');
		test.equal(path.toString(), TOOLS.platformString('/'), 'file root');
		return test.done();
	}
};
