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

  var cmdPath = void 0;
  var modulePaths = findNodeModules();

  for (var i = 0; i < modulePaths.length; i++) {
    cmdPath = modulePaths[i] + '/ava/cli.js';
    if (fs.existsSync(cmdPath)) {
      break;
    }
  }

  var forked = fork(cmdPath, [process.cwd() + '/' + testFile], { silent: true });
  var errMsg = '',
      status = void 0;

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
    var data = null;
    if (code === 0) {
      errMsg = '';
      status = 'passed';
      data = JSON.parse(fs.readFileSync(logFile));
    } else {
      status = 'failed';
    }
    deferred.resolve({ id: id, err: errMsg, data: data, status: status });[srcFile, testFile, logFile].forEach(function (file) {
      file = process.cwd() + '/' + file;
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
var findNodeModules = require('find-node-modules');

function defer() {
  var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  var ret = { context: context };
  ret.promise = new _promise2.default(function (resolve, reject) {
    ret.resolve = resolve;
    ret.reject = reject;
  });
  return ret;
}