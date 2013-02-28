var ASSERT = require('assert')
  , FILEPATH = require('./index')

var tests = [];


tests.push(function (done) {
    // Create a new file path.

    var path = FILEPATH.newPath('foo');

    equal(path.toString(), 'foo', '.toString()');

    // Multiple path parts.
    path = FILEPATH.newPath('foo', 'bar', 'baz');
    equal(path.toString(), 'foo/bar/baz', '.newPath(foo, bar, baz)');
    return done();
});

tests.push(function (done) {
    // .append() method.

    var p1 = FILEPATH.newPath('foo');

    var p2 = p1.append('bar');
    // Internal state is not changed.
    equal(p1.toString(), 'foo', '.append(bar)');

    // A new path object has been created.
    equal(p2.toString(), 'foo/bar', 'new .append(bar)');

    // Append multiple path parts.
    var p3 = p1.append('bar', 'baz');
    equal(p3.toString(), 'foo/bar/baz', '.append(bar, baz)');

    return done();
});


// End of testing.
tests.push(function () { console.log('PASSED'); });


// ---


// Test vocabulary

function assert(val, msg) {
    msg = 'assert '+ val +'; '+ msg;
    return ASSERT.ok(val, msg);
}

function equal(actual, expected, msg) {
    msg = actual +' !== '+ expected +'; '+ msg;
    return ASSERT.strictEqual(actual, expected, msg);
}

// Compose test functions using continuation passing.
function asyncStack(functions) {
    var callback = functions.pop()
      , last = callback

    functions.reverse().forEach(function (fn) {
        var child = callback;
        callback = function () {
            fn(child);
        };
    });
    return callback;
}

// Run tests.
if (module === require.main) {
    asyncStack(tests)();
}
