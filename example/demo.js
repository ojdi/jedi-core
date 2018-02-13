const jedi = require('../lib')

const code = `
module.exports = function (x, y) {
  // x()
  return x + y
}
`

const tests = `
test('one', t => {
  t.is(app(1, 2), 3)
})

test('two', t => {
  t.is(app('a', 'b'), 'ab')
})
`

;(async function () {
  const res = jedi({code, tests, timeout: 10000})
  console.log(res)

  const r = await res.promise
  if(r.err) {
    console.error(`${r.status}: \n${r.err}`)
  } else {
    console.log(r)
  }
}())
