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
  const res = source(code, tests)
  return runtime(res, timeLimit)
}
