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

	stat() {
		try {
			return fs.statSync(this.path);
		} catch (err) {
			if (err.code === 'ENOENT') {
				return null;
			}
			throw err;
		}
	}

	resolve(...paths) {
		const strings = paths.map((p, i) => {
			if (typeof p === 'string') return p;
			if (p && typeof p.path === 'string') return p.path;
			const err = new Error(`Invalid argument ${JSON.stringify(p)} at [${i}]`);
			Error.captureStackTrace(err, this.resolve);
			throw err;
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

		const err = new Error(`Invalid argument ${JSON.stringify(to)}`);
		Error.captureStackTrace(err, this.relative);
		throw err;
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

	isFile() {
		try {
			return fs.statSync(this.path).isFile();
		} catch (err) {
			if (err.code === 'ENOENT') {
				return false;
			}
			Error.captureStackTrace(err, this.isFile);
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
			Error.captureStackTrace(err, this.isDirectory);
			throw err;
		}
	}

	isAbsolute() {
		return path.isAbsolute(this.path);
	}

	ensureDir() {
		const abspath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);

		function getStat(fpath) {
			try {
				return fs.statSync(fpath);
			} catch (err) {
				if (err.code === 'ENOENT') {
					return null;
				}
				throw err;
			}
		}

		function makeDirectories(paths) {
			fs.mkdirSync(paths.pop());
			if (paths.length > 0) return makeDirectories(paths);
		}

		const todo = [];

		function ensureDir(dir) {
			const stat = getStat(dir);

			if (stat && stat.isDirectory()) {
				if (todo.length > 0) {
					return makeDirectories(todo.slice());
				}
				return;
			}

			if (stat) {
				throw new Error(`Path "${dir}" already exists but is not a directory.`);
			}

			todo.push(dir);
			return ensureDir(path.dirname(dir));
		}

		try {
			ensureDir(abspath);
		} catch (err) {
			Error.captureStackTrace(err, this.ensureDir);
			throw err;
		}

		return this;
	}

	createReadStream(options = {}) {
		const opts = Object.assign({ encoding: 'utf8' }, options);
		return fs.createReadStream(this.path, opts);
	}

	createWriteStream(options = {}) {
		const opts = Object.assign({ encoding: 'utf8' }, options);
		return fs.createWriteStream(this.path, opts);
	}

	readFile(options = {}) {
		const opts = Object.assign({
			encoding: 'utf8'
		}, options);

		const readErr = new Error('File read error');
		Error.captureStackTrace(readErr, this.readFile);

		return new Promise((resolve, reject) => {
			fs.readFile(this.path, opts, (err, data) => {
				if (err) {
					if (err.code === 'ENOENT') {
						return resolve(null);
					}
					const message = `${err.message} ${this.path}`;
					readErr.message = message;
					readErr.code = err.code;
					return reject(readErr);
				}

				return resolve(data);
			});
		});
	}

	writeFile(data, options = {}) {
		const opts = Object.assign({
			encoding: 'utf8'
		}, options);

		const abspath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);

		const error = new Error('File write error');
		Error.captureStackTrace(error, this.writeFile);

		function decorateError(err) {
			error.code = err.code;
			error.message = err.message;
			return error;
		}

		return new Promise((resolve, reject) => {
			const dir = new Filepath(abspath).dir();

			try {
				dir.ensureDir();
			} catch (err) {
				return reject(decorateError(err));
			}

			fs.writeFile(abspath, data, opts, (err) => {
				if (err) return reject(decorateError(err));
				return resolve(this);
			});
		});
	}

	copy(dest, options = {}) {
		const srcPath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);
		const destStr = typeof dest === 'string' ? dest : (dest && dest.path);
		if (!destStr) {
			const err = new Error('A dest argument must be provided to copy()');
			Error.captureStackTrace(err, this.copy);
			throw err;
		}
		const destPath = path.isAbsolute(destStr) ? destStr : path.resolve(destStr);
		const destFp = new Filepath(destPath);

		let sourceStats;
		let destStats;

		try {
			sourceStats = this.stat();
			destStats = destFp.stat();
		} catch (err) {
			Error.captureStackTrace(err, this.copy);
			throw err;
		}

		if (!sourceStats) {
			const err = new Error(`ENOENT: no such file or directory '${srcPath}'`);
			err.code = 'ENOENT';
			Error.captureStackTrace(err);
			throw err;
		}

		if (sourceStats.isDirectory() && destStats && !destStats.isDirectory()) {
			const err = new Error(`ENOTDIR: destination exists but is not a directory '${destPath}'`);
			err.code = 'ENOTDIR';
			Error.captureStackTrace(err);
			throw err;
		}

		if (sourceStats.isFile() && destStats && !destStats.isFile()) {
			const err = new Error(`ENOTFILE: destination exists but is not a file '${destPath}'`);
			err.code = 'ENOTFILE';
			Error.captureStackTrace(err);
			throw err;
		}

		if (destStats.ino && destStats.ino === sourceStats.ino) {
			const err = new Error(`Source and destination paths are the same '${srcPath}'`);
			Error.captureStackTrace(err);
			throw err;
		}

		const baseError = new Error('copy error');
		Error.captureStackTrace(baseError, this.copy);
	}

	readDir() {
		const abspath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);

		try {
			return fs.readdirSync(abspath).map((basename) => {
				return new Filepath(path.join(abspath, basename));
			});
		} catch (err) {
			if (err.code === 'ENOENT') return [];
			Error.captureStackTrace(err, this.readDir);
			throw err;
		}
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

