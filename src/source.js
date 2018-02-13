// compile input source and save to temp

import {transform} from 'babel-core'

import {readFileSync, writeFileSync, existsSync} from 'fs'

let babelOptions = {
  presets: ['env'],
  plugins: ['transform-runtime'],
}

if(existsSync('../.babelrc')) {
  babelOptions = JSON.parse(readFileSync('../.babelrc'))
}

export default function (id, code, tests, tmpPath) {
  code = `
    (function(require, process, child_process, global) {
      ${code}
    })(() => {}, null, null, null)
  `
  const compiledCode = transform(code, babelOptions)

  const tempFile = `${process.cwd()}/${tmpPath}/${id}.js`
  const tempTestFile = `${process.cwd()}/${tmpPath}/${id}.test.js`
  const tempTestLogFile = `${process.cwd()}/${tmpPath}/${id}.log.js`

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
    srcFile: `${tmpPath}/${id}.js`,
    testFile: `${tmpPath}/${id}.test.js`,
    logFile: `${tmpPath}/${id}.log.js`,
  }
}
