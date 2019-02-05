'use strict';

const { assert } = require('kixx-assert');
const path = require('path');
const fs = require('fs');
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

	test.describe('stats()', (t) => {
		t.it('returns a native Stats instance', () => {
			const subject = Filepath.create(__filename);
			const stats = subject.stats();
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
