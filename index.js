'use strict';

const path = require('path');
const fs = require('fs');


class FilePath {
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
				value: FilePath.SEP
			},
			delimiter: {
				enumerable: true,
				value: FilePath.DELIMITER
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

		return new FilePath(path.resolve.apply(path, strings));
	}

	relative(to) {
		if (typeof to === 'string') {
			return new FilePath(path.relative(this.path, to));
		}
		if (to && typeof to.path === 'string') {
			return new FilePath(path.relative(this.path, to.path));
		}

		throw new Error(`Invalid argument ${JSON.stringify(to)}`);
	}

	append(...args) {
		if (Array.isArray(args[0])) {
			return FilePath.create([ this.path ].concat(args[0]));
		}
		return FilePath.create([ this.path ].concat(args));
	}

	static create(...paths) {
		if (paths.length === 0) {
			return new FilePath(process.cwd());
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

		return new FilePath(path.join.apply(path, filteredPaths));
	}
}

module.exports = FilePath;
