#!/usr/bin/env node
'use strict';

var CP = require('child_process');
var FilePath = require('../').FilePath;
var Promise = require('bluebird');

exports.main = function () {
	console.log(' ### running lint_runner ###');
	var execFile = process.platform === 'win32' ? 'xo.cmd' : 'xo';
	return new Promise(function (resolve, reject) {
		var exec = FilePath.create().append('node_modules', '.bin', execFile);
		var proc = CP.spawn(exec.toString());
		proc.stdout.pipe(process.stdout);
		proc.stderr.pipe(process.stderr);
		proc.on('close', function (code) {
			if (code === 0) {
				return resolve(0);
			}
			return reject(new Error('Failed linter'));
		});
	});
};

if (require.main === module) {
	exports.main()
		.then(function () {
			console.log('lint_runner succeeded :)');
		})
		.catch(function (err) {
			console.error('lint_runner failed:');
			console.error(err.stack || err.message || err);
		});
}
