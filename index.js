const fs = require('fs')
const path = require('path')

class ImportUtil {

  constructor() {
    this.supportFileExt = ['.js', '.json']
  }

  checkFileLoop(resolve, reject) {
    return (fileName) => {
      fs.access(fileName, (err) => {
        if (err && err.code !== 'EEXIST') {
          return reject(err)
        }
        return resolve(require(fileName)) // eslint-disable-line global-require
      })
    }
  }

  catchPromiseErrInLoop(e, n, reject) {
    return (err) => {
      e = err
      n++
      if (n === this.supportFileExt.length) {
        return reject(e)
      }
      return true
    }
  }

  async(module) {
    const fileName = module
    return new Promise((resolve, reject) => {
      const fileInfo = path.parse(fileName)
      if (fileInfo.ext === '') {
        const e = null
        const n = 0
        for (const ext of this.supportFileExt) {
          new Promise((loopResolve, loopReject) => {
            this.checkFileLoop(loopResolve, loopReject)(`${fileName}${ext}`)
          })
          .then((object) => resolve(object))
          .catch(this.catchPromiseErrInLoop(e, n, reject))
        }
      } else {
        this.checkFileLoop(resolve, reject)(`${fileName}`)
      }
    })
  }
}

module.exports = new ImportUtil()
