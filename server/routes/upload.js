const express = require('express')
const readChunk = require('read-chunk')
const fileType = require('file-type')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const _ = require('lodash')

const validPathRe = new RegExp('^([a-z0-9/-' + global.appdata.regex.cjk + global.appdata.regex.arabic + ']+\\.[a-z0-9]+)$')
const validPathThumbsRe = new RegExp('^([a-z0-9]+\\.png)$')

const uploadRoutes = express.Router()

uploadRoutes.get('/t/*', (req, res, next) => {
  let fileName = req.params[0]
  if (!validPathThumbsRe.test(fileName)) {
    return res.sendStatus(404).end()
  }

  res.sendFile(fileName, {
    root: global.lcdata.getThumbsPath(),
    dotfiles: 'deny'
  }, (err) => {
    if (err) {
      res.status(err.status).end()
    }
  })
})

uploadRoutes.post('/img', global.lcdata.uploadImgHandler, (req, res, next) => {
  let destFolder = _.chain(req.body.folder).trim().toLower().value()

  global.upl.validateUploadsFolder(destFolder).then((destFolderPath) => {
    if (!destFolderPath) {
      res.json({
        msg: 'invalidfolder'
      })
      return true
    }

    Promise.map(req.files, (f) => {
      let destFilename = ''
      let destFilePath = ''

      return global.lcdata.validateUploadsFilename(f.originalname, destFolder, true).then((fname) => {
        destFilename = fname
        destFilePath = path.resolve(destFolderPath, destFilename)

        return readChunk(f.path, 0, 262)
      }).then((buf) => {
        let mimeInfo = fileType(buf)
        if (!_.includes(['image/png', 'image/jpeg', 'image/gif', 'image/webp'], mimeInfo.mime)) {
          return Promise.reject(new Error('invalidfiletype'))
        }
        return true
      }).then(() => {
        return fs.moveAsync(f.path, destFilePath, {
          clobber: false
        })
      }).then(() => {
        return {
          ok: true,
          filename: destFilename,
          filesize: f.size
        }
      }).reflect()
    }, {
      concurrency: 3
    }).then((results) => {
      let uplResults = _.map(results, (r) => {
        if (r.isFulfilled()) {
          return r.value()
        } else {
          return {
            ok: false,
            msg: r.reason().message
          }
        }
      })
      res.json({
        ok: true,
        results: uplResults
      })
      return true
    }).catch((err) => {
      res.json({
        ok: false,
        msg: err.message
      })
      return true
    })
  })
})

uploadRoutes.post('/file', global.lcdata.uploadFileHandler, (req, res, next) => {
  let destFolder = _.chain(req.body.folder).trim().toLower().value()

  global.upl.validateUploadsFolder(destFolder).then((destFolderPath) => {
    if (!destFolderPath) {
      res.json({
        msg: 'invalidfolder'
      })
      return true
    }

    Promise.map(req.files, (f) => {
      let destFilename = ''
      let destFilePath = ''

      return global.lcdata.validateUploadsFilename(f.originalname, destFolder, false).then((fname) => {
        destFilename = fname
        destFilePath = path.resolve(destFolderPath, destFilename)

        return fs.moveAsync(f.path, destFilePath, {
          clobber: false
        })
      }).then(() => {
        return {
          ok: true,
          filename: destFilename,
          filesize: f.size
        }
      }).reflect()
    }, {
      concurrency: 3
    }).then((results) => {
      let uplResults = _.map(results, (r) => {
        if (r.isFulfilled()) {
          return r.value()
        } else {
          return {
            ok: false,
            msg: r.reason().message
          }
        }
      })
      res.json({
        ok: true,
        results: uplResults
      })
      return true
    }).catch((err) => {
      res.json({
        ok: false,
        msg: err.message
      })
      return true
    })
  })
})

uploadRoutes.get('/folders', (req, res, next) => {
  global.upl.getUploadsFolders().then((f) => {
    res.status(200).send(f)
  })
})

uploadRoutes.post('/folders', (req, res, next) => {
  global.upl.createUploadsFolder(req.body.name).then((f) => {
    res.status(200).send(f)
  }).catch(error => {
    global.winston.error(error)
    res.status(404).json({
      msg: 'Could not create folder'
    })
  })
})

uploadRoutes.route('/images').post(function (req, res, next) {
  global.upl.getUploadsFiles('image', req.body.folder).then((f) => {
    res.status(200).send(f)
  })
})

uploadRoutes.get('/*', (req, res, next) => {
  const fileName = req.params[0]
  if (!validPathRe.test(fileName)) {
    return res.sendStatus(404).end()
  }
  // todo: Authentication-based access

  res.sendFile(fileName, {
    root: global.lcdata.getUploadsPath(),
    dotfiles: 'deny'
  }, (err) => {
    if (err) {
      res.status(err.status).end()
    }
  })
})

uploadRoutes.route('/*').delete(function (req, res, next) {
  const id = req.params[0]

  global.upl.deleteUploadsFile(id).then(() => {
    res.status(200).send()
  }
  , error => {
    global.winston.error(error)
  })
})

module.exports = uploadRoutes
