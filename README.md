Filepath
========

A cross platform interface for working with the file system in Node.js programs. Yes, it works with both posix and win32. So there.

[![NPM](https://nodei.co/npm/filepath.png?downloads=true)](https://nodei.co/npm/filepath/)

[![npm version](https://badge.fury.io/js/filepath.svg)](https://badge.fury.io/js/filepath)

__Built by [@kixxauth](https://twitter.com/kixxauth)__

Installation
------------
The most common use of Filepath is to use it as a library. In that case, just include it in your Node.js project by adding a line for "filepath" in your `pacakge.json` dependencies. For more information about your `package.json` file, you should check out the npm documentation by running `npm help json`.

Alternatively, you can quickly install Filepath for use in a project by running

	npm install filepath

which will install filepath in your `node_modules/` folder.

Quick Start
-----------
### Load the module
```JS
var filepath = require('filepath');
```

### Create a new FilePath instance
FilePath.create just takes a string to create a new path object:
```JS
var path = filepath.create(__filname);
```

It's important to remember that a FilePath instance is *not* a String. The 'path' property of a FilePath instance is the string representation of the FilePath instance, which is the same thing as calling .toString().
```JS
console.log(path);
// "{ [String: '/Users/kris/filepath/README.md'] path: '/Users/kris/filepath/README.md' }"

path.path;
path.valueOf();
path.toString();
path + '';
// "/Users/kris/filepath/README.md"

assert(path.path === path.toString())
```

API Reference
-------------

#### Class Methods
* [.create()](#create)
* [.root()](#root)
* [.home()](#home)

#### Instance Methods

##### Manipulation
* [#append](#append)
* [#resolve](#resolve)
* [#dir](#split)
* [#copy](#copy)
* [#remove](#remove)
* [#relative](#relative) (returns a String)

##### To String
* [#toString](#toString)
* [#valueOf](#valueOf)
* [#basename](#basename)
* [#extname](#extname)
* [#split](#split)
* [#relative](#relative)

##### Tests
* [#exists](#exists)
* [#isFile](#isFile)
* [#isDirectory](#isDirectory)

##### Reading and Writing
* [#read](#read)
* [#write](#write)
* [#require](#require)
* [#copy](#copy)

##### Streams
* [#newReadStream](#newReadStream)
* [#newWriteStream](#newWriteStream)

#### Directories
* [#mkdir](#mkdir)
* [#list](#list)
* [#recurse](#recurse)

### Class Methods

#### .create()
Returns a new FilePath instance. Defaults to the current working directory if you don't pass any arguments.
```JS
var path = filepath.create();
assert(path.toString() === process.cwd());
path.toString();
// "/Users/kris/projects/filepath"
```
Joins multiple arguments into a single path object.
```JS
var path = filepath.create(__dirname, 'foo', 'bar');
assert(path.toString() === __dirname + '/foo/bar');
path.path; // Same as .toString();
// "/Users/kris/projects/filepath/foo"
```

#### .root()
Returns a FilePath instance representing the root system path.
```JS
// On a posix system:
assert(filepath.root().toString() === '/');
```

#### .home()
Returns a FilePath instance representing the users's home directory. This is achieved using environment variables `process.env.HOME` on posix and `process.env.USERPROFILE` on win32.
```JS
assert(filepath.home().toString() === '/home/kris');
```

### Instance Methods

#### #append()
Joins an arbitrary number of arguments and appends them onto the path. Returns a new FilePath instance, leaving the original intact.
```JS
var path1 = filepath.create(__dirname);
var path2 = path1.append('foo', 'bar');
var path3 = path1.append('baz');

assert(path1.toString() === __dirname);
assert(path2.toString() === __dirname + '/foo/bar');
assert(path3.toString() === __dirname + '/baz');
```

#### #resolve()
Resolves a relative path with this one. Returns a new FilePath instance, leaving the original intact.
```JS
var path = filepath
  .create('/home/kris/filepath/lib')
  .resolve('../README.md');

assert(path.toString() === '/home/kris/filepath/README.md');
```

#### #dir()
Pops off the file or directory basename. The same as doing `../` on a posix system. Returns a new FilePath instance.
```JS
var path = filepath.create('/home/kris/filepath').dir();

assert(path.toString() === '/home/kris');
```

#### #copy()
Copies the current path to the given path. Resolves with a new FilePath instance representing the new location. Also can be invoked synchronously.

See also: [Promises](#promises) and [Error Handling](#error-handling)
```JS
filepath
  .create(__filename)
  .copy('/tmp/README.md')
  .then(function (target) {
    // The callback value `target` is a new FilePath instance.
    assert(target.toString() === '/tmp/README.md');
  })
  .catch(console.error);
```

Pass in mixed parts as the target.
```JS
var targetDir = filepath.root().append('tmp');
filepath
  .create(__filename)
  .copy(targetDir, 'README.md');
```

Or you can copy a file *synchronously*:
```JS
var target = filepath
  .create(__filename)
  .copy('/tmp/README.md', {sync: true});
assert(target.toString() === '/tmp/README.md');
```

#### #relative()
Returns the relative String required to reach the passed in path. Note that #relative() returns a *String* and *not* a FilePath instance.
```JS
var rel = filepath
  .create('/home/kris/filepath/lib')
  .relative('/home/kris/filepath/test');

assert(rel === '../test');
```

#### #basename()
```JS
var path = FP.create('/home/kris/filepath/README.md').basename();
// Note that basename() returns a *String*
assert(path === 'README.md')
```

#### #extname()
```JS
var ext = FP.create('/home/kris/filepath/README.md').extname()
// Note that extname() returns a *String*
assert(ext === '.md')
```

#### #split()
```JS
var parts = FP.create('/home/kris/filepath/README.md').split()
assert(Array.isArray(parts))
assert(parts[0] === 'home')
assert(parts.pop() === 'README.md')
```

#### #exists()
```JS
var path = FP.create(__dirname)
assert(path.exists())
assert(!path.append('foo').exists())
```

#### #isFile()
```JS
var path = FP.create(__filename)
assert(path.isFile())
```

#### #isDirectory()
```JS
var path = FP.create(__dirname)
assert(path.isDirectory())
```

#### #list()
```JS
var li = FP.create(__dirname).list()
// Listing a directory returns an Array of fully resolved FilePath instances
assert(Array.isArray(li))
assert(li[4] instanceof FP.FilePath)
assert(li[4].toString() === '/home/kris/filepath/README.md')
```

#### #recurse()
```JS
FP.create(__dirname).recurse(function (path) {
  // Each listing is a FilePath object with a fully resolved path string.
  assert(path instanceof FP.FilePath)
  assert(path.toString().indexOf(__dirname) === 0)
})
```

#### #mkdir()
```JS
// Works kinda like 'mkdir -P'.
var path = FP.create('/tmp/some/new/deep/dir').mkdir()
assert(path instanceof FP.FilePath)
assert(path.exists())
assert(path.isDirectory())
```

#### #newReadStream()
```JS
var FS = require('fs')
var stream = FP.create(__filename).newReadStream()
assert(stream instanceof FS.ReadStream)
```

#### #newWriteStream()
```JS
var FS = require('fs')
var stream = FP.create('/tmp/new_file.txt').newWriteStream()
assert(stream instanceof FS.WriteStream)
```

#### #read()
```JS
var path = FP.create(__filename)

// #read() returns a promise object with #then() and #failure() methods.
path.read().then(function (contents) {
  // Defaults to 'utf8' so you get a string here instead of a Buffer.
  assert(typeof contents === 'string')
}).failure(console.error)

// Or you can read a file *synchronously*:
var readmeContents = path.read({sync: true})
assert(typeof readmeContents === 'string')
```

#### #write()
```JS
var path = FP.create('/tmp/new_file.txt')

// #write() returns a promise object with #then() and #failure() methods.
// Writes the file contents in 'utf8' by default.
path.write('Hello world!\n').then(function (returnedPath) {
  assert(returnedPath === path)
  assert(path.read({sync: true}) === 'Hello world!\n')
}).failure(console.error)

// Or you can write a file *synchronously*:
var syncPath = FP.create('/tmp/new_file_sync.txt')
syncPath.write('Overwrite with this text', {sync: true})
assert(syncPath.read({sync: true}) === 'Hello world!\n')
```

## Testing
To run the tests, just do

  npm test

You should see the test results output.


Copyright and License
---------------------
Copyright (c) 2013-2015 by Kris Walker <kris@kixx.name> (http://www.kixx.name).

Unless otherwise indicated, all source code is licensed under the MIT license.
See LICENSE for details.
