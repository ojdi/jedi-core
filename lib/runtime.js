'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (_ref) {
  var id = _ref.id,
      srcFile = _ref.srcFile,
      testFile = _ref.testFile,
      logFile = _ref.logFile;
  var timeLimit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30000;

  var cmdPath = __dirname + '/../node_modules/ava/cli.js';
  var path = __dirname + '/../temp';
  var forked = fork(cmdPath, [path + '/' + testFile], { silent: true });
  var errMsg = '';

  var timer = setTimeout(function () {
    errMsg = 'Time limit exceed: ' + timeLimit;
    forked.kill('SIGHUP');
  }, timeLimit);

  var deferred = defer({ id: id, srcFile: srcFile, testFile: testFile, logFile: logFile });

  // forked.on('message', (msg) => {
  //   console.log('msg')
  // })

  // forked.stdout.on('data', (buff) => {
  //   console.log(String(buff))
  // })

  forked.stderr.on('data', function (buff) {
    errMsg += String(buff);
  });

  forked.on('close', function (code) {
    clearTimeout(timer);
    var data = [];
    if (code === 0) {
      errMsg = '';
      data = JSON.parse(fs.readFileSync(path + '/' + logFile));
    }
    deferred.resolve({ err: errMsg, data: data });[srcFile, testFile, logFile].forEach(function (file) {
      file = path + '/' + file;
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  return deferred;
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('child_process'),
    fork = _require.fork;

var fs = require('fs');

function defer() {
  var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  var ret = { context: context };
  ret.promise = new _promise2.default(function (resolve, reject) {
    ret.resolve = resolve;
    ret.reject = reject;
  });
  return ret;
}