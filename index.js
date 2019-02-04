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

	static create(...paths) {
		let thisPath;

		if (paths.length > 0 && paths[0]) {
			thisPath = paths[0];
		} else if (paths.length === 0) {
			thisPath = process.cwd();
		} else {
			const filteredPaths = paths
				.filter((str) => {
					return Boolean(str);
				})
				.map((str) => {
					return String(str);
				});

			thisPath = path.join.apply(path, filteredPaths);
		}

		return new FilePath(thisPath);
	}
}

module.exports = FilePath;
