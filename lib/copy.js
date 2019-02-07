'use strict';

// options.preserveTimestamps
// options.dereferenceLinks
module.exports = function copy(options, srcPath, destPath, baseError) {
	// function decorateError(err) {
	// 	baseError.code = err.code;
	// 	baseError.message = err.message;
	// 	return baseError;
	// }

	// return new Promise((resolve, reject) => {
	// 	function copyRecursively(src, dest) {
	// 	}
	// });
};

// function onLink(options, src, dest, next) {
// 	let resolvedSrc;
// 	try {
// 		resolvedSrc = fs.readlinkSync(src.path);
// 	} catch (err) {
// 		return next(err);
// 	}

// 	// Destination does not yet exist and we are dereferencing links.
// 	if (!dest.stat && options.dereferenceLinks) {
// 		const srcFile = Object.assign({}, src, { path: resolvedSrc });
// 		return copyFile(options, srcFile, dest, next);
// 	}

// 	// Destination does not yet exist and we are keeping links.
// 	if (!dest.stat) {
// 		try {
// 			fs.symlinkSync(resolvedSrc, dest.path);
// 		} catch (err) {
// 			return next(err);
// 		}
// 		return next();
// 	}

// 	try {
// 		fs.readlinkSync(src.dest);
// 	} catch (err) {
// 		if (err.code !== 'EINVAL' && err.code !== 'UNKNOWN') {
// 			return next(err);
// 		}

// 		// Destination already exists and is a regular directory.
// 		if (dest.stat.isDirectory()) {
// 			return rimraf().then(() => {
// 				if (options.dereferenceLinks) {
// 					const srcFile = Object.assign({}, src, { path: resolvedSrc });
// 					// Any internal errors will get passed to the next() callback.
// 					copyFile(options, srcFile, dest, next);
// 				} else {
// 					// Any internal errors will get caught in the promise chain and
// 					// passed to the next() callback via the catch().
// 					fs.symlinkSync(resolvedSrc, dest.path);
// 				}
// 			}).catch(next);
// 		}
// 	}

// 	// Destintation is a file or link.
// 	try {
// 		fs.unlinkSync(src.dest);
// 	} catch (err) {
// 		return next(err);
// 	}

// 	if (options.dereferenceLinks) {
// 		const srcFile = Object.assign({}, src, { path: resolvedSrc });
// 		// Any internal errors will get passed to the next() callback.
// 		return copyFile(options, srcFile, dest, next);
// 	}


// 	fs.symlinkSync(resolvedSrc, dest.path);
// }

// function copyFile(options, src, dest, next) {
// 	if (typeof fs.copyFile === 'function') {
// 		fs.copyFile(src.path, dest.path, (err) => {
// 			if (err) {
// 				next(err);
// 			} else {
// 				try {
// 					setModeAndTimestamps(options, src.stats, dest.path);
// 				} catch (err) {
// 					return next(err);
// 				}
// 				return next();
// 			}
// 		});
// 		return true;
// 	}

// 	const rstream = fs.createReadStream(src.path);

// 	rstream.once('error', next).once('open', () => {
// 		const wstream = fs.createWriteStream(dest.path, { mode: src.stats.mode });

// 		wstream.once('error', next).once('open', () => {
// 			wstream.once('close', () => {
// 				try {
// 					setModeAndTimestamps(options, src.stats, dest.path);
// 				} catch (err) {
// 					return next(err);
// 				}
// 				return next();
// 			});

// 			rstream.pipe(wstream);
// 		});
// 	});

// 	return true;
// }

// function isSubdir (src, dest) {
// 	const srcArray = src.split(path.sep)
// 	const destArray = dest.split(path.sep)
// 	return srcArray.reduce((acc, current, i) => {
// 		return acc && destArray[i] === current;
// 	}, true)
// }

// if (sourceStats.isDirectory() && isSrcSubdir(srcPath, destPath)) {
// 	const err = new Error(`Cannot copy '${srcPath}' to a subdirectory of iteself, '${destPath}'`);
// 	Error.captureStackTrace(err);
// 	throw err;
// }

// function setModeAndTimestamps(options, stats, dest) {
// 	fs.chmodSync(dest, stats.mode);
// 	if (options.preserveTimestamps) {
// 		fs.utimesSync(dest, stats.atime, stats.mtime);
// 	}
// }
