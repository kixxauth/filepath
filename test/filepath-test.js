'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

const { assert } = require('kixx-assert');

const Filepath = require('../filepath.js');


module.exports = (test) => {
	test.describe('class enum constants', (t) => {
		t.it('has the SEP constant', () => {
			const { SEP } = Filepath;
			assert.isNonEmptyString(path.sep);
			assert.isEqual(path.sep, SEP);
		});

		t.it('has the DELIMITER constant', () => {
			const { DELIMITER } = Filepath;
			assert.isNonEmptyString(path.delimiter);
			assert.isEqual(path.delimiter, DELIMITER);
		});
	});

	test.describe('create() static class method', (t) => {
		t.describe('with no arguments', (t1) => {
			t1.it('uses cwd', () => {
				const subject = Filepath.create();
				const cwd = process.cwd();
				assert.isNonEmptyString(cwd);
				assert.isEqual(cwd, subject.path);
			});
		});

		t.describe('with an Array of mixed objects', (t1) => {
			t1.it('resolves all the paths', () => {
				const subject = Filepath.create([
					Filepath.create(__dirname),
					'foo',
					Filepath.create('bar.js')
				]);
				const fp = path.join(__dirname, 'foo', 'bar.js');
				assert.isEqual(fp, subject.path);
			});
		});

		t.describe('with mixed arguments', (t1) => {
			t1.it('resolves all the paths', () => {
				const subject = Filepath.create(
					Filepath.create(__dirname),
					'foo',
					Filepath.create('bar.js')
				);
				const fp = path.join(__dirname, 'foo', 'bar.js');
				assert.isEqual(fp, subject.path);
			});
		});
	});

	test.describe('instance enum constants', (t) => {
		t.it('has the sep constant', () => {
			const subject = Filepath.create();
			assert.isNonEmptyString(path.sep);
			assert.isEqual(path.sep, subject.sep);
		});

		t.it('has the DELIMITER constant', () => {
			const subject = Filepath.create();
			assert.isNonEmptyString(path.delimiter);
			assert.isEqual(path.delimiter, subject.delimiter);
		});
	});

	test.describe('toString()', (t) => {
		t.it('converts path to string', () => {
			const subject = Filepath.create();
			const cwd = process.cwd();
			assert.isNonEmptyString(cwd);
			assert.isEqual(cwd, subject.toString());
		});
	});

	test.describe('valueOf()', (t) => {
		t.it('exposes path string value', () => {
			const subject = Filepath.create();
			const cwd = process.cwd();
			assert.isNonEmptyString(cwd);
			assert.isEqual(cwd, subject.valueOf());
		});
	});

	test.describe('stat()', (t) => {
		t.it('returns a native Stats instance', () => {
			const subject = Filepath.create(__filename);
			const stats = subject.stat();
			assert.isDefined(fs.Stats);
			assert.isOk(stats instanceof fs.Stats);
		});
	});

	test.describe('resolve()', (t) => {
		t.it('resolves multiple relative paths', () => {
			const subject = Filepath.create(__dirname).resolve('..', 'filepath.js');
			const fp = path.resolve(__dirname, '..', 'filepath.js');
			assert.isNonEmptyString(fp);
			assert.isEqual(fp, subject.path);
		});
		t.it('resolves multiple relative Filepath instances', () => {
			const subject = Filepath.create(__dirname).resolve(
				Filepath.create('..'),
				Filepath.create('filepath.js')
			);
			const fp = path.resolve(__dirname, '..', 'filepath.js');
			assert.isNonEmptyString(fp);
			assert.isEqual(fp, subject.path);
		});
	});

	test.describe('relative()', (t) => {
		t.it('can interperet a string', () => {
			const subject = Filepath.create(__dirname).relative(process.cwd());
			const fp = path.relative(__dirname, process.cwd());
			assert.isNonEmptyString(fp);
			assert.isEqual(fp, subject.path);
		});
		t.it('can interperet a Filepath instance', () => {
			const subject = Filepath.create(__dirname).relative(Filepath.create());
			const fp = path.relative(__dirname, process.cwd());
			assert.isNonEmptyString(fp);
			assert.isEqual(fp, subject.path);
		});
	});

	test.describe('append()', (t) => {
		t.it('can accept a mixed array of strings and Filepaths', () => {
			const subject = Filepath.create(__dirname).append([
				'foo',
				Filepath.create('bar.baz')
			]);
			const fp = path.join(__dirname, 'foo', 'bar.baz');
			assert.isNonEmptyString(fp);
			assert.isEqual(fp, subject.path);
		});
		t.it('can accept a mixed arguments of strings and Filepaths', () => {
			const subject = Filepath.create(__dirname).append(
				'foo',
				Filepath.create('bar.baz')
			);
			const fp = path.join(__dirname, 'foo', 'bar.baz');
			assert.isNonEmptyString(fp);
			assert.isEqual(fp, subject.path);
		});
	});

	test.describe('dirname()', (t) => {
		t.it('returns the directory name of the path', () => {
			const subject = Filepath.create(__filename).dir();
			assert.isEqual(__dirname, subject.path);
		});
	});

	test.describe('isFile()', (t) => {
		t.describe('when path does not exist', (t1) => {
			const subject = Filepath.create(__dirname).append('foo.js');
			assert.isEqual(false, subject.isFile());
		});
		t.describe('when path is not a file', (t1) => {
			const subject = Filepath.create(__dirname);
			assert.isEqual(false, subject.isFile());
		});
		t.describe('when path is a file', (t1) => {
			const subject = Filepath.create(__dirname).append('filepath-test.js');
			assert.isEqual(true, subject.isFile());
		});
	});

	test.describe('isDirectory()', (t) => {
		t.describe('when path does not exist', (t1) => {
			const subject = Filepath.create(__dirname).append('foo');
			assert.isEqual(false, subject.isDirectory());
		});
		t.describe('when path is not a directory', (t1) => {
			const subject = Filepath.create(__filename);
			assert.isEqual(false, subject.isDirectory());
		});
		t.describe('when path is a directory', (t1) => {
			const subject = Filepath.create(__dirname);
			assert.isEqual(true, subject.isDirectory());
		});
	});

	test.describe('createReadStream() and createWriteStream()', (t) => {
		let fixture = null;
		let result = null;
		let sampleChunk;

		function copyAndReadFile(src, dest) {
			return new Promise((resolve, reject) => {
				const readStream = src.createReadStream();
				const writeStream = dest.createWriteStream();

				readStream.once('error', reject);
				writeStream.once('error', reject);

				readStream.on('data', (chunk) => {
					sampleChunk = chunk;
				});

				writeStream.once('finish', () => {
					fs.readFile(dest.path, (err, buff) => {
						if (err) {
							return reject(err);
						}
						resolve(buff.toString());
					});
				});

				readStream.pipe(writeStream);
			});
		}

		function readFile(src) {
			return new Promise((resolve, reject) => {
				fs.readFile(src.path, (err, buff) => {
					if (err) {
						return reject(err);
					}
					resolve(buff.toString());
				});
			});
		}

		t.before((done) => {
			const src = Filepath.create(__filename);
			const dest = Filepath.create(os.tmpdir()).append(`filepath-test-${Date.now()}.js`);

			copyAndReadFile(src, dest)
				.then((res) => {
					result = res;
					return readFile(src);
				})
				.then((res) => {
					fixture = res;
					done();
				})
				.catch(done);
		});

		t.it('reads and writes in utf8 by default', () => {
			assert.isEqual('string', typeof sampleChunk);
			assert.isNonEmptyString(fixture);
			assert.isEqual(fixture, result);
		});
	});

	test.describe('readFile()', (t1) => {
		t1.describe('with invalid path', (t) => {
			const subject = Filepath.create(__dirname, 'foo');
			let result;

			t.before((done) => {
				subject.readFile().then((text) => {
					result = text;
					done();
				}).catch(done);
			});

			t.it('returns null', () => {
				assert.isEqual(null, result);
			});
		});

		t1.describe('with directory', (t) => {
			const subject = Filepath.create(__dirname);
			let result;

			t.before((done) => {
				subject.readFile().then((text) => {
					result = text;
					done();
				}).catch((err) => {
					result = err;
					done();
				});
			});

			t.it('rejects with an error', () => {
				assert.isEqual('EISDIR', result.code);
				assert.isEqual(`EISDIR: illegal operation on a directory, read ${subject.path}`, result.message);
			});
		});

		t1.describe('with valid file', (t) => {
			const subject = Filepath.create(__filename);
			let result;

			t.before((done) => {
				subject.readFile().then((text) => {
					result = text;
					done();
				}).catch(done);
			});

			t.it('returns file contents', () => {
				assert.isNonEmptyString(result);
				assert.isOk(result.startsWith("'use strict'"));
			});
		});
	});

	test.describe('writeFile()', (t1) => {
		t1.describe('with new path', (t) => {
			const subject = Filepath.create(os.tmpdir()).append(`filepath-test-${Date.now()}`, 'async-new-file');
			let result;
			let contents;
			let exists = true;

			t.before((done) => {
				try {
					exists = Boolean(subject.stat());
				} catch (err) {
					return done(err);
				}

				subject.writeFile('foobar').then((res) => {
					result = res;
					contents = fs.readFileSync(subject.path, { encoding: 'utf8' });
					done();
				}).catch(done);
			});

			t.it('did not exist', () => {
				assert.isEqual(false, exists);
			});

			t.it('returns instance', () => {
				assert.isEqual(subject, result);
			});

			t.it('wrote the file', () => {
				assert.isEqual('foobar', contents);
			});
		});

		t1.describe('with directory', (t) => {
			const subject = Filepath.create(__dirname);
			let result;

			t.before((done) => {
				subject.writeFile('foobar').then((text) => {
					result = text;
					done();
				}).catch((err) => {
					result = err;
					done();
				});
			});

			t.it('rejects with an error', () => {
				assert.isEqual('EISDIR', result.code);
				assert.isEqual(`EISDIR: illegal operation on a directory, open '${subject.path}'`, result.message);
			});
		});

		t1.describe('with file => directory', (t) => {
			const subject = Filepath.create(__filename).append('foo');
			let result;

			t.before((done) => {
				try {
					subject.writeFile('foobar').then((f) => {
						result = f;
						done();
					}).catch((err) => {
						result = err;
						done();
					});
				} catch (err) {
					result = err;
					done();
				}
			});

			t.it('rejects with an error', () => {
				assert.isEqual(`Path "${subject.dir().path}" already exists but is not a directory.`, result.message);
			});
		});
	});

	test.describe('listDir()', (t) => {
		const basenames = [
			'README.md',
			'.eslintrc.yml',
			'.git',
			'.gitignore',
			'LICENSE',
			'filepath.js',
			'node_modules',
			'package-lock.json',
			'package.json',
			'test',
			'.npmignore'
		];

		const subject = Filepath.create(__dirname).dir();
		let results;

		t.before((done) => {
			subject.listDir().then((res) => {
				results = res;
				done();
			}).catch(done);
		});

		t.it('lists full Filepath instances', () => {
			assert.isOk(Array.isArray(results));
			assert.isEqual(basenames.length, results.length);
			results.forEach((p) => {
				const basename = p.basename();
				assert.isOk(basenames.includes(basename), `includes ${basename}`);
			});
		});
	});

	test.describe('split()', (t) => {
		const subject = Filepath.create(__filename).split();
		const parts = __filename.split(path.sep).filter((s) => Boolean(s));
		assert.isGreaterThan(0, parts.length);
		assert.isEqual(parts.length, subject.length);
		parts.forEach((part, i) => {
			assert.isEqual(part, subject[i]);
		});
	});

	test.describe('basename()', (t) => {
		t.it('returns a string with the extension', () => {
			const subject = Filepath.create(__filename).basename();
			assert.isEqual('filepath-test.js', subject);
		});
		t.it('returns a string without the extension', () => {
			const subject = Filepath.create(__filename).basename('.js');
			assert.isEqual('filepath-test', subject);
		});
	});

	test.describe('extname()', (t) => {
		t.it('returns a dot string', () => {
			const subject = Filepath.create(__filename).extname();
			assert.isEqual('.js', subject);
		});
	});
};
