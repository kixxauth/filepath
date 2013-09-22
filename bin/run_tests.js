var NFS = require('fs')
  , NPATH = require('path')

  , NODEUNIT = require('nodeunit')

  , testPath = NPATH.resolve(process.argv[2])
  , fileMatcher = /test\.js$/
  , files


function readTree(dir) {
	var collection = []
	  , list = NFS.readdirSync(dir)

	list.forEach(function (item) {
		var filepath = NPATH.join(dir, item)
		  , stats = NFS.statSync(filepath)

		if (stats.isDirectory()) {
			collection = collection.concat(readTree(filepath))
		} else if (stats.isFile() && fileMatcher.test(filepath)) {
			collection.push(NPATH.relative(process.cwd(), filepath));
		}
	})

	return collection;
}

files = readTree(testPath);
NODEUNIT.reporters.default.run(files);