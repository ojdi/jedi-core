const jedi = require('../lib')

const code = `
module.exports = function (x, y) {
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
  const res = jedi(code, tests, 10000)
  console.log(res)

  const r = await res.promise
  if(r.err) {
    console.error(r.err)
  } else {
    console.log(r)
  }
}())
