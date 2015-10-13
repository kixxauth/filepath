var NFS = require('fs');
var NPATH = require('path');

var NODEUNIT = require('nodeunit');

var testPath = NPATH.resolve(process.argv[2]);
var fileMatcher = /test\.js$/;
var files;

function readTree(dir) {
	var collection = [];
	var list = NFS.readdirSync(dir);

	list.forEach(function (item) {
		var filepath = NPATH.join(dir, item);
		var stats = NFS.statSync(filepath);

		if (stats.isDirectory()) {
			collection = collection.concat(readTree(filepath));
		} else if (stats.isFile() && fileMatcher.test(filepath)) {
			collection.push(NPATH.relative(process.cwd(), filepath));
		}
	});

	return collection;
}

files = readTree(testPath);
NODEUNIT.reporters.default.run(files);
