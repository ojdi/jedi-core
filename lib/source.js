'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (code, tests) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  code = '\n    (function(require, process, global) {\n      ' + code + '\n    })(() => {}, null, null)\n  ';
  var compiledCode = (0, _babelCore.transform)(code, babelOptions);

  var tempFileName = 'c' + String(Math.random()).slice(2);
  var tempFile = __dirname + '/../temp/' + tempFileName + '.js';
  var tempTestFile = __dirname + '/../temp/' + tempFileName + '.test.js';
  var tempTestLogFile = __dirname + '/../temp/' + tempFileName + '.log.js';

  (0, _fs.writeFileSync)(tempFile, compiledCode.code);

  tests = '\n    const test = require(\'ava\')\n    const app = require(\'' + tempFile + '\')\n    let time = process.hrtime(), diff = 0\n    const fs = require(\'fs\')\n    const costs = []\n\n    test.beforeEach(t => {\n      time = process.hrtime()\n    })\n    \n    test.afterEach(t => {\n      const [s, ns] = process.hrtime(time)\n      const cost = process.memoryUsage()\n      cost.time = s * 1e3 + ns * 1e-6\n      cost.context = t.context\n      costs.push(cost)\n    })\n\n    test.after(t => {\n      fs.writeFileSync(\'' + tempTestLogFile + '\', JSON.stringify(costs))\n    })\n\n    ;(function(require, process, global) {\n      ' + tests + '\n    })(() => {}, null, null)\n  ';
  var compiledTests = (0, _babelCore.transform)(tests, babelOptions);

  (0, _fs.writeFileSync)(tempTestFile, compiledTests.code);

  return {
    id: tempFileName,
    srcFile: tempFileName + '.js',
    testFile: tempFileName + '.test.js',
    logFile: tempFileName + '.log.js'
  };
};

var _babelCore = require('babel-core');

var _fs = require('fs');

// compile input source and save to temp

var babelOptions = JSON.parse((0, _fs.readFileSync)('../.babelrc'));