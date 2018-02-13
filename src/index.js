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

module.exports = function ({id = `c${String(Math.random()).slice(2)}`,
  code = defaultCode,
  tests = defaultTest,
  timeout = 30000}) {
  let res
  try {
    res = source(id, code, tests)
  } catch (ex) {
    return {promise: Promise.resolve({id, err: ex.message, data: [], status: 'compile failed'}), context: {id}}
  }
  return runtime(res, timeout)
}
