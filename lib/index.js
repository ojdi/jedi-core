'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _source = require('./source');

var _source2 = _interopRequireDefault(_source);

var _runtime = require('./runtime');

var _runtime2 = _interopRequireDefault(_runtime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultCode = '\n  module.exports = function () {\n  \n  }\n';

var defaultTest = '    \n  test(\'default\', t => {\n    t.is(typeof app, \'function\')\n  })\n';

module.exports = function () {
  var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultCode;
  var tests = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultTest;
  var timeLimit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30000;

  var res = void 0;
  try {
    res = (0, _source2.default)(code, tests);
  } catch (ex) {
    return { promise: _promise2.default.resolve({ err: ex.message, data: null, status: 'compile failed' }), context: null };
  }
  return (0, _runtime2.default)(res, timeLimit);
};