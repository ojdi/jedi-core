const {fork} = require('child_process')
const fs = require('fs')

function defer(context = null) {
  const ret = {context}
  ret.promise = new Promise((resolve, reject) => {
    ret.resolve = resolve
    ret.reject = reject
  })
  return ret
}

export default function ({id, srcFile, testFile, logFile}, timeLimit = 30000) {
  const cmdPath = `${__dirname}/../node_modules/ava/cli.js`
  const path = `${__dirname}/../temp`
  const forked = fork(cmdPath, [`${path}/${testFile}`], {silent: true})
  let errMsg = '',
    status

  const timer = setTimeout(() => {
    errMsg = `Time limit exceed: ${timeLimit}`
    forked.kill('SIGHUP')
  }, timeLimit)

  const deferred = defer({id, srcFile, testFile, logFile})

  // forked.on('message', (msg) => {
  //   console.log('msg')
  // })

  // forked.stdout.on('data', (buff) => {
  //   console.log(String(buff))
  // })

  forked.stderr.on('data', (buff) => {
    errMsg += String(buff)
  })

  forked.on('close', (code) => {
    clearTimeout(timer)
    let data = null
    if(code === 0) {
      errMsg = ''
      status = 'passed'
      data = JSON.parse(fs.readFileSync(`${path}/${logFile}`))
    } else {
      status = 'failed'
    }
    deferred.resolve({id, err: errMsg, data, status})
    ;[srcFile, testFile, logFile].forEach((file) => {
      file = `${path}/${file}`
      if(fs.existsSync(file)) {
        fs.unlinkSync(file)
      }
    })
  })

  return deferred
}
