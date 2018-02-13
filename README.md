# Online judge core

## 使用方法

接受 {id, code, tests, timeout}（缺省为30000ms） 作为参数，如果id缺省，系统会自动生成一个随机id。

code是提交的模块代码，必须包含module.exports，而且类型要是函数。模块中不能使用process、child_process和require。

tests是测试用例，支持[ava](https://github.com/avajs/ava)，其中也不能使用process、child_process和require。

在tests中，默认使用app，对应code中的module.exports导出的函数。

jedi本身返回一个带有context和promise的defer对象，context中包含有唯一id，以及存储code、tests和测试log的临时文件。

测试异步执行，执行完成之后defer.promise返回执行结果，如果测试不通过，那么返回结果的err对象不为空，否则返回对象的err为空，且data数组返回每个case调用时消耗的时间、内存和context信息。

测试返回的结果里面有三种字符串状态，分别是failed、passed和compile failed，分别表示运行结果不正确、运行结果正确和编译不通过。

```js
const jedi = require('jedi')

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
  /*
  { context:
   { id: 'c3504846325744171',
     srcFile: 'c3504846325744171.js',
     testFile: 'c3504846325744171.test.js',
     logFile: 'c3504846325744171.log.js' },
  resolve: [Function],
  reject: [Function],
  promise: Promise { <pending> } }
  */

  const r = await res.promise

  if(r.err) {
    console.error(`${r.status}: \n${r.err}`)
  } else {
    console.log(r)
  /*
  { id: 'c3504846325744171',
    err: '',
    data:
    [ { rss: 42352640,
        heapTotal: 32325632,
        heapUsed: 12089136,
        external: 157322,
        time: 0.708568,
        context: {} },
      { rss: 42352640,
        heapTotal: 32325632,
        heapUsed: 12099456,
        external: 157322,
        time: 0.08567899999999999,
        context: {} } ],
    status: 'passed' }
  */
  }
}())
```

## 使用jedi-core实现自己的 Online Judge System

首先根据提交的代码查找对应的tests，然后将代码和tests传给jedi，根据返回的内容中的context往数据库中写入记录，并响应用户请求。等待返回的promise成功后，更新context写入的数据记录。

```js
commitAction() {
  const {id, code} = this.get()
  const problems = think.model('problems')
  const {tests, timeLimit, memoryLimit} = await problems.get(id) // 根据id获取对应问题的 tests
  const res = jedi({code, tests, timeout: 10000}) // 不传id的话会自动生成答题ID，

  const answerID = res.context.id // 获取答题ID
  const answers = think.model('answers')

  // 如果是练习或测试，这里还需要再存一个相应的练习或测试的ID
  const insertID = await answers.add({problemID: id, answerID, code, status: 'pending', err: ''})

  res.promise.then(({status, err, data}) => {
    if(status === 'passed') {
      // 运行结果无误，检查时间和内存是否超过要求
      if(!data.every(({heapUsed}) => heapUsed <= memoryLimit)){
        status = 'memory limit exceed'
      } else if(!data.every(({time}) => time <= timeLimit)) {
        status = 'time limit exceed'
      }
    }
    // 运行完毕，更新答题状态
    await answers.where({id: insertID}).update({status, err})
  })
}
```
