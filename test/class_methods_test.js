var FILEPATH = require('../index')


exports[".home() class method"] = {
  "creates a FilePath object around the user's home directory": function (test) {
    var path = FILEPATH.home();
    test.equal(path.exists(), true, "home dir exists");
    test.equal(path.toString(), process.env.HOME, "home dir");
    return test.done();
  }
};

exports[".root() class method"] = {
  "creates a FilePath object around the root directory": function (test) {
    var path = FILEPATH.root()
    test.equal(path.exists(), true, "root dir exists");
    test.equal(path.toString(), '/', 'file root');
    return test.done();
  }
}
