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
		const abspath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);
		const { sep } = path;
		const parts = abspath.split(sep);
		const first = parts.shift();

		const getStat = (thisPath) => {
			try {
				return fs.statSync(thisPath);
			} catch (err) {
				if (err.code === 'ENOENT') {
					return null;
				}
				Error.captureStackTrace(err, this.writeFile);
				throw err;
			}
		};

		parts.reduce((partialPath, part) => {
			if (part) {
				try {
					const newPath = `${partialPath}${sep}${part}`;
					const stat = getStat(newPath);
					if (!stat) {
						fs.mkdirSync(newPath);
					} else if (!stat.isDirectory()) {
						const err = new Error(`Cannot write to "${newPath}"; it already exists and is not a directory.`);
						Error.captureStackTrace(err, this.ensureDir);
						err.code = 'ENOTDIR';
						throw err;
					}
					return newPath;
				} catch (err) {
					Error.captureStackTrace(err, this.writeFile);
					throw err;
				}
			}
			return partialPath;
		}, first);

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
			encoding: 'utf8',
			sync: false
		}, options);

		const { sync } = opts;
		delete opts.sync;

		const handleError = (err) => {
			if (err.code === 'ENOENT') {
				return null;
			} else if (err.code === 'EISDIR') {
				const newError = new Error(`Cannot read "${this.path}"; it is a directory.`);
				newError.code = 'PATH_IS_DIRECTORY';
				Error.captureStackTrace(newError, this.readFile);
				throw newError;
			}
			Error.captureStackTrace(err, this.readFile);
			throw err;
		};

		if (sync) {
			try {
				return fs.readFileSync(this.path, opts);
			} catch (err) {
				return handleError(err);
			}
		}

		return new Promise((resolve, reject) => {
			fs.readFile(this.path, opts, (err, data) => {
				if (err) {
					try {
						return resolve(handleError(err));
					} catch (e) {
						return reject(e);
					}
				}

				return resolve(data);
			});
		});
	}

	writeFile(data, options = {}) {
		const opts = Object.assign({
			encoding: 'utf8',
			sync: false
		}, options);

		const { sync } = opts;
		delete opts.sync;

		const handleError = (err) => {
			if (err.code === 'EISDIR') {
				const newError = new Error(`Cannot write "${this.path}"; it is a directory.`);
				newError.code = 'PATH_IS_DIRECTORY';
				Error.captureStackTrace(newError, this.writeFile);
				throw newError;
			}
			Error.captureStackTrace(err, this.writeFile);
			throw err;
		};

		const abspath = path.isAbsolute(this.path) ? this.path : path.resolve(this.path);
		const dirname = path.dirname(abspath);
		const dir = Filepath.prototype.stat.call({ path: dirname });

		if (dir && !dir.isDirectory()) {
			const err = new Error(`Cannot write to "${dirname}"; not a directory.`);
			Error.captureStackTrace(err, this.writeFile);
			err.code = 'ENOTDIR';
			throw err;
		} else if (!dir) {
			Filepath.prototype.ensureDir.call({ path: dirname });
		}

		const self = this;

		if (sync) {
			try {
				fs.writeFileSync(abspath, data, opts);
				return self;
			} catch (err) {
				return handleError(err);
			}
		}

		return new Promise((resolve, reject) => {
			fs.writeFile(abspath, data, opts, (err) => {
				if (err) {
					try {
						return resolve(handleError(err));
					} catch (e) {
						return reject(e);
					}
				}

				return resolve(self);
			});
		});
	}

	copy() {
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
