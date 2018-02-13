'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _source = require('./source');

var _source2 = _interopRequireDefault(_source);

var _runtime = require('./runtime');

var _runtime2 = _interopRequireDefault(_runtime);

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultCode = '\n  module.exports = function () {\n  \n  }\n';

var defaultTest = '    \n  test(\'default\', t => {\n    t.is(typeof app, \'function\')\n  })\n';

module.exports = function (_ref) {
  var _ref$id = _ref.id,
      id = _ref$id === undefined ? 'c' + String(Math.random()).slice(2) : _ref$id,
      _ref$code = _ref.code,
      code = _ref$code === undefined ? defaultCode : _ref$code,
      _ref$tests = _ref.tests,
      tests = _ref$tests === undefined ? defaultTest : _ref$tests,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === undefined ? 30000 : _ref$timeout,
      _ref$tmpPath = _ref.tmpPath,
      tmpPath = _ref$tmpPath === undefined ? '.jedi-tests' : _ref$tmpPath;

  var res = void 0;
  try {
    if (!(0, _fs.existsSync)(tmpPath)) {
      (0, _fs.mkdirSync)(tmpPath);
    }
    res = (0, _source2.default)(id, code, tests, tmpPath);
  } catch (ex) {
    return { promise: _promise2.default.resolve({ id: id, err: ex.message, data: [], status: 'compile failed' }), context: { id: id } };
  }
  return (0, _runtime2.default)(res, timeout);
};