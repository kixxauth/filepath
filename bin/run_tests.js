#!/usr/bin/env node
'use strict';

var Promise = require('bluebird');
var filepath = require('../');
var nodeunit = require('nodeunit');

var FILEMATCHER = /test\.js$/;

// args.path - A FilePath instance
exports.main = function (args) {
	console.log(' ### running tests ###');
	var path = args.path;
	var files;

	if (path.isDirectory()) {
		files = readTree(path);
	} else {
		files = [path.toString()];
	}

	return runNodeunit(files);
};

// If this is the main run module, execute automatically.
if (require.main === module) {
	exports.main({path: filepath.create().resolve(process.argv[2])})
		.then(function () {
			console.log('run_tests succeeded :)');
		})
		.catch(function (err) {
			console.error('run_tests failed:');
			console.error(err.stack || err.message || err);
		});
}

//
// Utilities
//

function runNodeunit(files) {
	return new Promise(function (resolve, reject) {
		nodeunit.reporters.default.run(files, null, function (err) {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}

function readTree(dir) {
	var collection = [];

	dir.list().forEach(function (path) {
		if (path.isDirectory()) {
			collection = collection.concat(readTree(path));
		} else if (path.isFile() && FILEMATCHER.test(path.toString())) {
			collection.push(path.toString());
		}
	});

	return collection;
}
