'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (id, code, tests, tmpPath) {
  code = '\n    (function(require, process, child_process, global) {\n      ' + code + '\n    })(() => {}, null, null, null)\n  ';
  var compiledCode = (0, _babelCore.transform)(code, babelOptions);

  var tempFile = process.cwd() + '/' + tmpPath + '/' + id + '.js';
  var tempTestFile = process.cwd() + '/' + tmpPath + '/' + id + '.test.js';
  var tempTestLogFile = process.cwd() + '/' + tmpPath + '/' + id + '.log.js';

  (0, _fs.writeFileSync)(tempFile, compiledCode.code);

  tests = '\n    const test = require(\'ava\')\n    const app = require(\'' + tempFile + '\')\n    let time = process.hrtime(), diff = 0\n    const fs = require(\'fs\')\n    const costs = []\n\n    test.beforeEach(t => {\n      time = process.hrtime()\n    })\n    \n    test.afterEach(t => {\n      const [s, ns] = process.hrtime(time)\n      const cost = process.memoryUsage()\n      cost.time = s * 1e3 + ns * 1e-6\n      cost.context = t.context\n      costs.push(cost)\n    })\n\n    test.after(t => {\n      fs.writeFileSync(\'' + tempTestLogFile + '\', JSON.stringify(costs))\n    })\n\n    ;(function(require, process, child_process, global) {\n      ' + tests + '\n    })(() => {}, null, null, null)\n  ';
  var compiledTests = (0, _babelCore.transform)(tests, babelOptions);

  (0, _fs.writeFileSync)(tempTestFile, compiledTests.code);

  return {
    id: id,
    srcFile: tmpPath + '/' + id + '.js',
    testFile: tmpPath + '/' + id + '.test.js',
    logFile: tmpPath + '/' + id + '.log.js'
  };
};

var _babelCore = require('babel-core');

var _fs = require('fs');

// compile input source and save to temp

var babelOptions = {
  presets: ['env'],
  plugins: ['transform-runtime']
};

if ((0, _fs.existsSync)('../.babelrc')) {
  babelOptions = JSON.parse((0, _fs.readFileSync)('../.babelrc'));
}