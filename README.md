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
var path = FP.newPath(__filname)
assert(path instanceof FP.FilePath)

// The 'path' property is the string representation of the FilePath instance.
assert(path.toString() === path.path)

// Defaults to current working directory:
assert(FP.newPath().toString() === process.cwd())

// Joins multiple parts:
assert(FP.newPath(__dirname, 'foo').toString() === __dirname + '/foo')
```

### #append()
```JS
var path = FP.newPath(__dirname).append('foo').append('bar')
assert(path instanceof FP.FilePath)
assert(path.toString() === __dirname + '/foo/bar')
```

### #resolve()
```JS
var path = FP.newPath(__dirname, 'lib').resolve('../README.md')
assert(path instanceof FP.FilePath)
assert(path.toString() === __filename)
```

### #dirname()
```JS
var path = FP.newPath(__filename).dirname()
assert(path instanceof FP.FilePath)
assert(path.toString() === __dirname)
```

### #basename()
```JS
var path = FP.newPath(__filename).basename()
assert(path instanceof FP.FilePath)
assert(path.toString() === 'README.md')
```

### #extname()
```JS
var ext = FP.newPath(__filename).extname()
assert(typeof ext === 'string')
assert(ext === '.md')
```

### #split()
```JS
var parts = FP.newPath(__dirname).split()
assert(Array.isArray(parts))
// Notice that the first and last parts are not '' even though
// the __dirname begins with a '/'.
assert(parts.shift() === 'home')
assert(parts.pop() === 'filepath')
```

### #exists()
```JS
var path = FP.newPath(__filename)
assert(path.exists())
assert(!path.append('foo').exists())
```

### #isFile()
```JS
var path = FP.newPath(__filename)
assert(path.isFile())
assert(!path.resolve('../').isFile())
```

### #isDirectory()
```JS
var path = FP.newPath(__dirname)
assert(path.isDirectory())
assert(!path.append('README.md').isDirectory())
```

### #list()
```JS
var li = FP.newPath(__dirname).list()
assert(Array.isArray(li))
var readme = li[9]
assert(readme instanceof FP.FilePath)
assert(readme.toString() === __filepath)
``` 

### #recurse()
```JS
var counter = 0
FP.newPath(__dirname).recurse(function (path) {
  // Each listing is a FilePath object with a fully resolved path string.
  assert(path instanceof FP.FilePath)
  assert(path.toString().indexOf(__dirname) === 0)
})
```

### #mkdir()
```JS
// Works kinda like 'mkdir -P'.
var path = FP.newPath('/tmp/some/new/deep/dir')
assert(path instanceof FP.FilePath)
assert(path.exists())
assert(path.isDirectory())
```

### #newReadStream()
```JS
var FS = require('fs')
var stream = FP.newPath(__filename).newReadStream()
assert(stream instanceof FS.ReadStream)
```

### #newWriteStream()
```JS
var FS = require('fs')
var stream = FP.newPath('/tmp/new_file.txt').newWriteStream()
assert(stream instanceof FS.WriteStream)
```

### #read()
```JS
var path = FP.newPath(__filename)

// #read() returns a promise object with #then() and #failure() methods.
path.read().then(function (contents) {
  // Defaults to 'utf8' so you get a string here instead of a Buffer.
  assert(typeof contents === 'string')
}).failure(console.error)
```

### #write()
```JS
var FS = require('fs')
var path = FP.newPath('/tmp/new_file.txt')

// #write() returns a promise object with #then() and #failure() methods.
path.write('Hello world!\n').then(function (returnedPath) {
  assert(returnedPath === path)
  // Writes the file contents in 'utf8' by default.
  var content = FS.readFileSync(path.toString(), {encoding: 'utf8'})
  assert(content === 'Hello world!\n')
}).failure(console.error)
```

### #copy()
```JS
var FS = require('fs')
var path = FP.newPath(__filename)
var originalContent = FS.readFileSync(path.toString(), {encoding: 'utf8'})

// #copy() returns a promise object with #then() and #failure() methods.
path.copy('/tmp/README.md').then(function (target) {
  // The callback value (`target`) is a new FilePath instance.
  assert(target instanceof FP.FilePath)
  assert(target.toString() === '/tmp/README.md')
  var targetContent = FS.readFileSync(target.toString(), {encoding: 'utf8'})
  assert(targetContent === originalContent)
}).failure(console.error)
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
Copyright (c) 2013 by Kris Walker <kris@kixx.name> (http://www.kixx.name).

Unless otherwise indicated, all source code is licensed under the MIT license.
See LICENSE for details.
