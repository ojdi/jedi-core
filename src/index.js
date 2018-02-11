import source from './source'
import runtime from './runtime'

const defaultCode = `
  module.exports = function () {
  
  }
`

const defaultTest = `    
  test('default', t => {
    t.is(typeof app, 'function')
  })
`

module.exports = function (code = defaultCode, tests = defaultTest, timeLimit = 30000) {
  let res
  try {
    res = source(code, tests)
  } catch (ex) {
    return {promise: Promise.resolve({err: ex.message, data: null, status: 'compile failed'}), context: null}
  }
  return runtime(res, timeLimit)
}
