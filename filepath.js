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
		return new Promise((resolve, reject) => {
			fs.stat(this.path, (err, stat) => {
				if (err && err.code === 'ENOENT') return resolve(null);
				if (err) return reject(err);
				return resolve(stat);
			});
		});
	}

	statSync() {
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
		const error = new Error('ensureDir error');
		Error.captureStackTrace(error, this.ensureDir);

		function decorateError(err) {
			error.message = err.message;
			error.code = err.code;
			return error;
		}

		return new Promise((resolve, reject) => {
			const getStat = (thisPath, cb) => {
				fs.stat(thisPath, (err, stat) => {
					if (err && err.code === 'ENOENT') {
						return cb(null);
					}
					if (err) {
						return reject(decorateError(err));
					}
					return cb(stat);
				});
			};

			const abspath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);
			const todo = [];

			const makeDirectories = (paths) => {
				fs.mkdir(paths.pop(), (err) => {
					if (err) return reject(decorateError(err));
					if (paths.length > 0) return makeDirectories(paths);
					return resolve(this);
				});
			};

			const ensureDir = (dir) => {
				getStat(dir, (stat) => {
					if (stat && stat.isDirectory()) {
						if (todo.length > 0) {
							return makeDirectories(todo.slice());
						}
						return resolve(this);
					}

					if (stat) {
						return reject(decorateError(
							new Error(`Path "${dir}" already exists but is not a directory.`)
						));
					}

					todo.push(dir);
					return ensureDir(path.dirname(dir));
				});
			};

			ensureDir(abspath);
		});
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

		const writeErr = new Error('File write error');
		Error.captureStackTrace(writeErr, this.writeFile);

		const writeFile = (fp) => {
			return new Promise((resolve, reject) => {
				fs.writeFile(fp, data, opts, (err) => {
					if (err) return reject(err);
					return resolve(this);
				});
			});
		};

		const dir = new Filepath(abspath).dir();

		return dir.ensureDir().then(() => {
			return writeFile(abspath);
		}).catch((err) => {
			writeErr.message = err.message;
			writeErr.code = err.code;
			return Promise.reject(writeErr);
		});
	}

	copy(dest) {
		const srcPath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);
		const destStr = typeof dest === 'string' ? dest : (dest && dest.path);
		if (!destStr) {
			const err = new Error('A dest argument must be provided to copy()');
			Error.captureStackTrace(err, this.copy);
			throw err;
		}
		const destPath = path.isAbsolute(destStr) ? destStr : path.resolve(destStr);

		const error = new Error('copy error');
		Error.captureStackTrace(error, this.copy);

		function decorateError(err) {
			error.code = err.code;
			error.message = err.message;
			return error;
		}

		return new Promise((resolve, reject) => {
		});
	}

	readDir() {
		const abspath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);

		const error = new Error('readdir error');
		Error.captureStackTrace(error, this.copy);

		function decorateError(err) {
			error.code = err.code;
			error.message = err.message;
			return error;
		}

		return new Promise((resolve, reject) => {
			fs.stat(abspath, (err, stat) => {
				if (err) return reject(decorateError(err));

				if (!stat.isDirectory()) {
					const e = new Error(`ENOTDIR: not a directory, readDir '${this.path}'`);
					e.code = 'ENOTDIR';
					return reject(decorateError(e));
				}

				fs.readdir(this.path, (e, list) => {
					if (e) return reject(decorateError(e));

					return resolve(list.map((basename) => {
						return this.append(basename);
					}));
				});
			});
		});
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

