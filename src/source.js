// compile input source and save to temp

import {transform} from 'babel-core'

import {readFileSync, writeFileSync} from 'fs'

const babelOptions = JSON.parse(readFileSync('../.babelrc'))

export default function (code, tests, options = {}) {
  code = `
    (function(require, process, global) {
      ${code}
    })(() => {}, null, null)
  `
  const compiledCode = transform(code, babelOptions)

  const tempFileName = `c${String(Math.random()).slice(2)}`
  const tempFile = `${__dirname}/../temp/${tempFileName}.js`
  const tempTestFile = `${__dirname}/../temp/${tempFileName}.test.js`
  const tempTestLogFile = `${__dirname}/../temp/${tempFileName}.log.js`

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

    ;(function(require, process, global) {
      ${tests}
    })(() => {}, null, null)
  `
  const compiledTests = transform(tests, babelOptions)

  writeFileSync(tempTestFile, compiledTests.code)

  return {
    id: tempFileName,
    srcFile: `${tempFileName}.js`,
    testFile: `${tempFileName}.test.js`,
    logFile: `${tempFileName}.log.js`,
  }
}
