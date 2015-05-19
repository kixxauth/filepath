var FS = require('fs')

  , TOOLS    = require('./tools')
  , FILEPATH = require('../index')


exports["#newReadStream() method"] = {

  "creates new ReadStream instance": function (test) {
    var stream = FILEPATH.newPath(__filename).newReadStream()
    test.expect(1);
    test.ok(stream instanceof FS.ReadStream)
    stream.close(test.done);
    return;
  },

  "with options": function (test) {
    var path = FILEPATH.newPath(__dirname, 'fixtures', 'test.ini')
      , buff = ''
      , stream = path.newReadStream({encoding: 'base64'})

    stream.on('data', function (chunk) {
      buff += chunk;
    });

    stream.on('end', function () {
      test.strictEqual(buff, 'Zm9vPWJhcg0K')
      return test.done();
    })

    return;
  }
};

exports["#newWriteStream() method"] = {
  setUp: function (done) {
    FILEPATH.newPath('/tmp/test-writestream-file.txt').remove();
    return done();
  },

  "creates a new WriteStream instance": function (test) {
    var stream = FILEPATH.newPath('/tmp/test-writestream-file.txt').newWriteStream()
    test.expect(1);
    test.ok(stream instanceof FS.WriteStream);
    stream.close(test.done);
    return;
  },

  "with options": function (test) {
    test.expect(2);
    var stream
      , path = FILEPATH.newPath('/tmp/test-writestream-file.txt')

    test.strictEqual(path.exists(), false, 'path does not exist yet')

    // Unlike Node.js, encoding defaults to 'utf8' (instead of null).
    stream = path.newWriteStream()

    stream.on('finish', function () {
      path.read().then(testContent, test.done);
    });

    function testContent(content) {
      test.strictEqual(content, 'foobar');
      return test.done();
    }

    stream.write('foobar');
    stream.end();
    return;
  }
};