Filepath
========

A cross platform interface for working with the file system in Node.js programs. Yes, it works with both posix and win32. So there.

[![NPM](https://nodei.co/npm/filepath.png)](https://nodei.co/npm/filepath/)

__Built by [@kixxauth](https://twitter.com/kixxauth)__

## Installation
The most common use of Filepath is to use it as a library. In that case, just include it in your Node.js project by adding a line for "filepath" in your `pacakge.json` dependencies. For more information about your `package.json` file, you should check out the npm documentation by running `npm help json`.

Alternatively, you can quickly install Filepath for use in a project by running

	npm install filepath

which will install filepath in your `node_modules/` folder.

API Quick Reference
-------------------

### Load the module
```JS
var FP = require('filepath')
```

### Create a new FilePath object
```JS
// FilePath.create just takes a string to create a new path object:
var path = FP.create(__filname)
assert(path instanceof FP.FilePath)

// It's important to remember that a FilePath instance is *not* a String.
// The 'path' property of a FilePath instance is the string representation
// of the FilePath instance, which is the same thing as calling .toString().
assert(path.path === path.toString())

// Defaults to current working directory if you don't pass any arguments:
var path = FP.create()
assert(path.toString() === process.cwd())

// Joins multiple arguments into a single path object:
var path = FP.create(__dirname, 'foo')
assert(path.toString() === __dirname + '/foo')
```

### Class Methods

### .root()
```JS
// Handy shortcut class method.
assert(FP.root().toString() === '/')
```

### .home()
```JS
// Another handy shortcut class method.
assert(FP.home().toString() === '/home/kris')
```

### Instance Methods

### #append()
```JS
var path = FP.create(__dirname).append('foo', 'bar').append('baz')
assert(path.toString() === __dirname + '/foo/bar/baz')
```

### #resolve()
```JS
var path = FP.create('/home/kris/filepath', 'lib').resolve('../README.md')
assert(path.toString() === '/home/kris/filepath/README.md')
```

### #relative()
```JS
var path = FP.create('/home/kris/filepath/lib')
  .relative('/home/kris/filepath/test');
assert(path.toString() === '../test')
```

### #dir()
```JS
var path = FP.create('/home/kris/filepath').dir();
assert(path.toString() === '/home/kris')
```

### #basename()
```JS
var path = FP.create('/home/kris/filepath/README.md').basename();
// Note that basename() returns a *String*
assert(path === 'README.md')
```

### #extname()
```JS
var ext = FP.create('/home/kris/filepath/README.md').extname()
// Note that extname() returns a *String*
assert(ext === '.md')
```

### #split()
```JS
var parts = FP.create('/home/kris/filepath/README.md').split()
assert(Array.isArray(parts))
assert(parts[0] === 'home')
assert(parts.pop() === 'README.md')
```

### #exists()
```JS
var path = FP.create(__dirname)
assert(path.exists())
assert(!path.append('foo').exists())
```

### #isFile()
```JS
var path = FP.create(__filename)
assert(path.isFile())
```

### #isDirectory()
```JS
var path = FP.create(__dirname)
assert(path.isDirectory())
```

### #list()
```JS
var li = FP.create(__dirname).list()
// Listing a directory returns an Array of fully resolved FilePath instances
assert(Array.isArray(li))
assert(li[4] instanceof FP.FilePath)
assert(li[4].toString() === '/home/kris/filepath/README.md')
```

### #recurse()
```JS
FP.create(__dirname).recurse(function (path) {
  // Each listing is a FilePath object with a fully resolved path string.
  assert(path instanceof FP.FilePath)
  assert(path.toString().indexOf(__dirname) === 0)
})
```

### #mkdir()
```JS
// Works kinda like 'mkdir -P'.
var path = FP.create('/tmp/some/new/deep/dir').mkdir()
assert(path instanceof FP.FilePath)
assert(path.exists())
assert(path.isDirectory())
```

### #newReadStream()
```JS
var FS = require('fs')
var stream = FP.create(__filename).newReadStream()
assert(stream instanceof FS.ReadStream)
```

### #newWriteStream()
```JS
var FS = require('fs')
var stream = FP.create('/tmp/new_file.txt').newWriteStream()
assert(stream instanceof FS.WriteStream)
```

### #read()
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

### #write()
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

### #copy()
```JS
var path = FP.create(__filename)
var originalContent = path.read({sync: true})

// #copy() returns a promise object with #then() and #failure() methods.
path.copy('/tmp/README.md').then(function (target) {
  // The callback value (`target`) is a new FilePath instance.
  assert(target.toString() === '/tmp/README.md')
  assert(target.read({sync: true}) === originalContent)
}).failure(console.error)

// Or you can copy a file *synchronously*:
syncPath = FP.create(__dirname, 'package.json')
originalSyncContent = syncPath.read({sync: true})
syncTarget = syncPath.copy('/tmp/package.json')
assert(syncTarget.toString() === '/tmp/package.json')
assert(syncTarget.read({sync: true}) === originalSyncContent)
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
