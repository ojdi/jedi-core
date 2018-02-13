// compile input source and save to temp

import {transform} from 'babel-core'

import {readFileSync, writeFileSync} from 'fs'

const babelOptions = JSON.parse(readFileSync('../.babelrc'))

export default function (id, code, tests, options = {}) {
  code = `
    (function(require, process, child_process, global) {
      ${code}
    })(() => {}, null, null, null)
  `
  const compiledCode = transform(code, babelOptions)

  const tempFile = `${__dirname}/../temp/${id}.js`
  const tempTestFile = `${__dirname}/../temp/${id}.test.js`
  const tempTestLogFile = `${__dirname}/../temp/${id}.log.js`

  writeFileSync(tempFile, compiledCode.code)

  tests = `
    const test = require('ava')
    const app = require('${tempFile}')
    let time = process.hrtime(), diff = 0
    const fs = require('fs')
    const costs = []

    test.beforeEach(t => {
      time = process.hrtime()
    })
    
    test.afterEach(t => {
      const [s, ns] = process.hrtime(time)
      const cost = process.memoryUsage()
      cost.time = s * 1e3 + ns * 1e-6
      cost.context = t.context
      costs.push(cost)
    })

    test.after(t => {
      fs.writeFileSync('${tempTestLogFile}', JSON.stringify(costs))
    })

    ;(function(require, process, child_process, global) {
      ${tests}
    })(() => {}, null, null, null)
  `
  const compiledTests = transform(tests, babelOptions)

  writeFileSync(tempTestFile, compiledTests.code)

  return {
    id,
    srcFile: `${id}.js`,
    testFile: `${id}.test.js`,
    logFile: `${id}.log.js`,
  }
}
