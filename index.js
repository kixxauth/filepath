'use strict';
const path = require('path');


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
