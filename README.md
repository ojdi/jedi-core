# Online judge core

## 使用方法

接受 code、tests、timeLimit（缺省为30秒） 作为参数

code是提交的模块代码，必须包含module.exports，而且类型要是函数。模块中不能使用process、child_process和require。

tests是测试用例，支持[ava](https://github.com/avajs/ava)，其中也不能使用process、child_process和require。

在tests中，默认使用app，对应code中的module.exports导出的函数。

jedi本身返回一个带有context和promise的defer对象，context中包含有一个唯一id，以及存储code、tests和测试log的临时文件

测试异步执行，执行完成之后defer.promise返回执行结果，如果测试不通过，那么返回结果的err对象不为空，否则返回对象的err为空，且data数组返回每个case调用时消耗的时间、内存和context信息。

```js
const jedi = require('jedi')

const code = `
module.exports = function (x, y) {
  return x + y
}
`

const tests = `
test(t => {
  t.is(app(1, 2), 3)
})

test(t => {
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
```
