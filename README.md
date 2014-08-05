Filepath
========

A little utility interface for working with the file system in Node.js programs.

## Installation
The most common use of Filepath is to use it as a library. In that case, just
include it in your Node.js project by adding a line for Filepath in your
`pacakge.json`. For more information about your `package.json` file, you should
check out the npm documentation by running `npm help json`.

Alternatively, you can quickly install Filepath for use in a project by running

	npm install filepath

which will install filepath in your `node_modules/` folder.

## Testing
To run the tests, just do

  ./manage test

You should see the test results output.

API Quick Reference
-------------------

### Load the module
```JS
var FP = require('filepath')
```

### Create a new FilePath object
```JS
var path = FP.create(__filname)
assert(path instanceof FP.FilePath)

// The 'path' property is the string representation of the FilePath instance.
assert(path.toString() === path.path)

// Defaults to current working directory:
var path = FP.create()
assert(path.toString() === process.cwd())

// Joins multiple parts from arguments:
var path = FP.create(__dirname, 'foo')
assert(path.toString() === __dirname + '/foo')
```

### #append()
```JS
var path = FP.create(__dirname).append('foo', 'bar').append('baz')
assert(path.toString() === __dirname + '/foo/bar/baz')
```

### #resolve()
```JS
var path = FP.create(__dirname, 'lib').resolve('../README.md')
assert(path.toString() === __filename)
```

### #dirname()
```JS
var path = FP.create(__filename).dirname()
assert(path.toString() === __dirname)
```

### #basename()
```JS
var path = FP.create(__filename).basename()
assert(path.toString() === 'README.md')
```

### #extname()
```JS
var ext = FP.create(__filename).extname()
assert(ext === '.md')
```

### #split()
```JS
var parts = FP.create(__dirname).split()
assert(Array.isArray(parts))
assert(parts.shift() === 'home')
assert(parts.pop() === 'filepath')
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
assert(Array.isArray(li))
var readme = li[9]
assert(readme instanceof FP.FilePath)
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

### .root()
```JS
// Handy shortcut class method.
assert(FP.root() === '/')
```

### .home()
```JS
// Another handy shortcut class method.
assert(FP.home() === '/home/kris')
```


Copyright and License
---------------------
Copyright (c) 2014 by Kris Walker <kris@kixx.name> (http://www.kixx.name).

Unless otherwise indicated, all source code is licensed under the MIT license.
See LICENSE for details.
