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

	stat(options = {}) {
		try {
			return fs.statSync(this.path, options);
		} catch (err) {
			if (err.code === 'ENOENT') {
				return null;
			}
			Error.captureStackTrace(err, this.stat);
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
						return cb(null, null);
					}
					if (err) {
						return cb(decorateError(err));
					}
					return cb(null, stat);
				});
			};

			const abspath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);
			const todo = [];

			const makeDirectories = (paths) => {
				fs.mkdir(paths.pop(), (err) => {
					if (err) return reject(err);
					if (paths.length > 0) return makeDirectories(paths);
					return resolve(this);
				});
			};

			const ensureDir = (dir) => {
				getStat(dir, (err, stat) => {
					if (err) return reject(err);

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

		return this.dir().ensureDir().then(() => {
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

		return new Promise((resolve, reject) => {
			const withDir = () => {
			};

			const withFile = () => {
			};

			const withStats = (srcStat, destStat) => {
				if (!srcStat) {
					const err = new Error(`Source path ${srcPath} does not exist`);
					Error.captureStackTrace(err, this.copy);
					return reject(err);
				}

				if (srcStat.isDirectory()) {
					if (destStat.isFile()) {
						const err = new Error('Source path is a directory but dest path is a file');
						Error.captureStackTrace(err, this.copy);
						return reject(err);
					}

					return withDir();
				}

				if (srcStat.isFile()) {
					return withFile();
				}

				const err = new Error(`Source path ${srcPath} is not a file or directory`);
				Error.captureStackTrace(err, this.copy);
				return reject(err);
			};
		});
	}

	listDir() {
		const stat = this.stat();
		if (!stat) {
			const err = new Error(`Path "${this.path}" does not exist.`);
			Error.captureStackTrace(err, this.list);
			err.code = 'ENOENT';
			throw err;
		}
		if (!stat.isDirectory()) {
			const err = new Error(`Path "${this.path}" is not a directory.`);
			Error.captureStackTrace(err, this.list);
			err.code = 'ENOTDIR';
			throw err;
		}

		return new Promise((resolve, reject) => {
			try {
				fs.readdir(this.path, (err, list) => {
					if (err) {
						Error.captureStackTrace(err, this.list);
						return reject(err);
					}

					return resolve(list.map((basename) => {
						return this.append(basename);
					}));
				});
			} catch (err) {
				Error.captureStackTrace(err, this.list);
				reject(err);
			}
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
