'use strict';

const path = require('path');
const fs = require('fs');


class Filepath {
	static get SEP() {
		return path.sep;
	}

	static get DELIMITER() {
		return path.delimiter;
	}

	static join(...args) {
		return path.join.apply(path, args);
	}

	constructor(p) {
		Object.defineProperties(this, {
			path: {
				enumerable: true,
				value: p
			},
			sep: {
				enumerable: true,
				value: Filepath.SEP
			},
			delimiter: {
				enumerable: true,
				value: Filepath.DELIMITER
			}
		});
	}

	stats(options = {}) {
		return fs.statSync(this.path, options);
	}

	resolve(...paths) {
		const strings = paths.map((p, i) => {
			if (typeof p === 'string') return p;
			if (p && typeof p.path === 'string') return p.path;
			throw new Error(`Invalid argument ${JSON.stringify(p)} at [${i}]`);
		});

		strings.unshift(this.path);

		return new Filepath(path.resolve.apply(path, strings));
	}

	relative(to) {
		if (typeof to === 'string') {
			return new Filepath(path.relative(this.path, to));
		}
		if (to && typeof to.path === 'string') {
			return new Filepath(path.relative(this.path, to.path));
		}

		throw new Error(`Invalid argument ${JSON.stringify(to)}`);
	}

	append(...args) {
		if (Array.isArray(args[0])) {
			return Filepath.create([ this.path ].concat(args[0]));
		}
		return Filepath.create([ this.path ].concat(args));
	}

	dir() {
		return new Filepath(path.dirname(this.path));
	}

	exists() {
		return fs.existsSync(this.path);
	}

	isFile() {
		try {
			return fs.statSync(this.path).isFile();
		} catch (err) {
			if (err.code === 'ENOENT') {
				return false;
			}
			throw err;
		}
	}

	isDirectory() {
		try {
			return fs.statSync(this.path).isDirectory();
		} catch (err) {
			if (err.code === 'ENOENT') {
				return false;
			}
			throw err;
		}
	}

	createReadStream(options = {}) {
		const opts = Object.assign({ encoding: 'utf8' }, options);
		return fs.createReadStream(this.path, opts);
	}

	createWriteStream(options = {}) {
		const opts = Object.assign({ encoding: 'utf8' }, options);
		return fs.createWriteStream(this.path, opts);
	}

	split() {
		return this.path.split(Filepath.SEP).filter((s) => Boolean(s));
	}

	basename(ext) {
		return path.basename(this.path, ext);
	}

	extname() {
		return path.extname(this.path);
	}

	toString() {
		return this.path;
	}

	valueOf() {
		return this.path;
	}

	static create(...paths) {
		if (paths.length === 0) {
			return new Filepath(process.cwd());
		}

		let pathStrings;

		if (Array.isArray(paths[0])) {
			pathStrings = paths[0];
		} else {
			pathStrings = paths;
		}

		const filteredPaths = pathStrings.filter((str) => {
			return Boolean(str);
		}).map((str) => {
			return String(str);
		});

		return new Filepath(path.join.apply(path, filteredPaths));
	}
}

module.exports = Filepath;