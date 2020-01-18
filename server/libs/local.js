'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const multer = require('multer')
const os = require('os')
const _ = require('lodash')

module.exports = {
  _uploadsPath: './repo/uploads',
  _uploadsThumbsPath: './data/thumbs',

  uploadImgHandler: null,

  init () {
    this._uploadsPath = path.resolve(global.appRoot, global.appconfig.paths.repo, 'uploads')
    this._uploadsThumbsPath = path.resolve(global.appRoot, global.appconfig.paths.data, 'thumbs')

    this.createBaseDirectories(global.appconfig)
    this.initMulter(global.appconfig)

    return this
  },

  initMulter () {
    let maxFileSizes = {
      img: global.appconfig.uploads.maxImageFileSize * 1024 * 1024,
      file: global.appconfig.uploads.maxOtherFileSize * 1024 * 1024
    }

    this.uploadImgHandler = multer({
      storage: multer.diskStorage({
        destination: (req, f, cb) => {
          cb(null, path.resolve(global.appRoot, global.appconfig.paths.data, 'temp-upload'))
        }
      }),
      fileFilter: (req, f, cb) => {
        // -> Check filesize

        if (f.size > maxFileSizes.img) {
          return cb(null, false)
        }

        // -> Check MIME type (quick check only)

        if (!_.includes(['image/png', 'image/jpeg', 'image/gif', 'image/webp'], f.mimetype)) {
          return cb(null, false)
        }

        cb(null, true)
      }
    }).array('imgfile', 20)

    this.uploadFileHandler = multer({
      storage: multer.diskStorage({
        destination: (req, f, cb) => {
          cb(null, path.resolve(global.appRoot, global.appconfig.paths.data, 'temp-upload'))
        }
      }),
      fileFilter: (req, f, cb) => {
        // -> Check filesize

        if (f.size > maxFileSizes.file) {
          return cb(null, false)
        }

        cb(null, true)
      }
    }).array('binfile', 20)

    return true
  },

  createBaseDirectories (appconfig) {
    global.winston.info('Checking data directories...')

    try {
      fs.ensureDirSync(path.resolve(global.appRoot, appconfig.paths.data))
      fs.emptyDirSync(path.resolve(global.appRoot, appconfig.paths.data))
      fs.ensureDirSync(path.resolve(global.appRoot, appconfig.paths.data, './cache'))
      fs.ensureDirSync(path.resolve(global.appRoot, appconfig.paths.data, './thumbs'))
      fs.ensureDirSync(path.resolve(global.appRoot, appconfig.paths.data, './temp-upload'))

      if (os.type() !== 'Windows_NT') {
        fs.chmodSync(path.resolve(global.appRoot, appconfig.paths.data, './temp-upload'), '755')
      }

      fs.ensureDirSync(path.resolve(global.appRoot, appconfig.paths.repo))
      fs.ensureDirSync(path.resolve(global.appRoot, appconfig.paths.repo, './uploads'))

      if (os.type() !== 'Windows_NT') {
        fs.chmodSync(path.resolve(global.appRoot, appconfig.paths.repo, './uploads'), '755')
      }
    } catch (err) {
      global.winston.error(err)
    }

    global.winston.info('Data and Repository directories are OK.')
  },

  getUploadsPath () {
    return this._uploadsPath
  },

  getThumbsPath () {
    return this._uploadsThumbsPath
  },

  validateUploadsFilename (f, fld, isImage) {
    let fObj = path.parse(f)
    let fname = _.chain(fObj.name).trim().toLower().kebabCase().value().replace(new RegExp('[^a-z0-9-' + global.appdata.regex.cjk + global.appdata.regex.arabic + ']', 'g'), '')
    let fext = _.toLower(fObj.ext)

    if (isImage && !_.includes(['.jpg', '.jpeg', '.png', '.gif', '.webp'], fext)) {
      fext = '.png'
    }

    f = fname + fext
    let fpath = path.resolve(this._uploadsPath, fld, f)

    return fs.statAsync(fpath).then((s) => {
      throw new Error('fileexists', {
        path: f
      })
    }).catch((err) => {
      if (err.code === 'ENOENT') {
        return f
      }
      throw err
    })
  }
}
