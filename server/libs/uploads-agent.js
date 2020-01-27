'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const readChunk = require('read-chunk')
const fileType = require('file-type')
const mime = require('mime-types')
const crypto = require('crypto')
const chokidar = require('chokidar')
const jimp = require('jimp')
const imageSize = Promise.promisify(require('image-size'))
const _ = require('lodash')

const logger = require('./logger')(true, 'UPL_AGENT')

module.exports = {

  _uploadsPath: './repo/uploads',
  _uploadsThumbsPath: './data/thumbs',

  _watcher: null,

  init () {
    let self = this

    self._uploadsPath = path.resolve(global.appRoot, global.appconfig.paths.repo, 'uploads')
    self._uploadsThumbsPath = path.resolve(global.appRoot, global.appconfig.paths.data, 'thumbs')

    return self
  },

  watch () {
    let self = this

    self._watcher = chokidar.watch(self._uploadsPath, {
      persistent: true,
      ignoreInitial: true,
      cwd: self._uploadsPath,
      depth: 1,
      awaitWriteFinish: true
    })

    // -> Add new upload file

    self._watcher.on('add', (p) => {
      let pInfo = self.parseUploadsRelPath(p)
      return self.processFile(pInfo.folder, pInfo.filename).then((mData) => {
        return global.db.Upload.findByIdAndUpdate(mData._id, mData, {
          upsert: true
        }).then(() => {
          logger.debug('New File Processed')
          global.socket.emit('fileuploaded')
        })
      })
    })
  },

  initialScan () {
    let self = this
    logger.info('Starting initial file scan')

    return fs.readdirAsync(self._uploadsPath).then((ls) => {
      // Get all folders

      return Promise.map(ls, (f) => {
        return fs.statAsync(path.join(self._uploadsPath, f)).then((s) => {
          return {
            filename: f,
            stat: s
          }
        })
      }).filter((s) => {
        return s.stat.isDirectory()
      }).then((arrDirs) => {
        let folderNames = _.map(arrDirs, 'filename')
        folderNames.unshift('')

        // Add folders to DB

        return global.db.Uploadfolder.deleteMany({}).then(() => {
          return global.db.Uploadfolder.insertMany(_.map(folderNames, (f) => {
            return {
              _id: 'f:' + f,
              name: f
            }
          }))
        }).then(() => {
          // Travel each directory and scan files

          let allFiles = []

          return Promise.map(folderNames, (fldName) => {
            let fldPath = path.join(self._uploadsPath, fldName)
            return fs.readdirAsync(fldPath).then((fList) => {
              return Promise.map(fList, (f) => {
                return self.processFile(fldName, f).then((mData) => {
                  if (mData) {
                    allFiles.push(mData)
                  }
                  return true
                })
              }, {
                concurrency: 3
              })
            })
          }, {
            concurrency: 1
          }).finally(() => {
            // Add files to DB

            return global.db.Upload.deleteMany({}).then(() => {
              if (_.isArray(allFiles) && allFiles.length > 0) {
                return global.db.Upload.insertMany(allFiles)
              } else {
                return true
              }
            })
          })
        })
      })
    }).then(() => {
      logger.info('Finished initial file scan')
      return self.watch()
    })
  },

  parseUploadsRelPath (f) {
    let fObj = path.parse(f)
    return {
      folder: fObj.dir,
      filename: fObj.base
    }
  },

  processFile (fldName, f) {
    let self = this

    let fldPath = path.join(self._uploadsPath, fldName)
    let fPath = path.join(fldPath, f)
    let fPathObj = path.parse(fPath)
    let fUid = crypto.createHash('md5').update(fldName + '/' + f).digest('hex')

    return fs.statAsync(fPath).then((s) => {
      if (!s.isFile()) {
        return false
      }

      // Get MIME info

      let mimeInfo = fileType(readChunk.sync(fPath, 0, 262))
      if (_.isNil(mimeInfo)) {
        mimeInfo = {
          mime: mime.lookup(fPathObj.ext) || 'application/octet-stream'
        }
      }

      // Images

      if (s.size < 3145728) { // ignore files larger than 3MB
        if (_.includes(['image/png', 'image/jpeg', 'image/gif', 'image/bmp'], mimeInfo.mime)) {
          return self.getImageSize(fPath).then((mImgSize) => {
            let cacheThumbnailPath = path.parse(path.join(self._uploadsThumbsPath, fUid + '.png'))
            let cacheThumbnailPathStr = path.format(cacheThumbnailPath)

            let mData = {
              _id: fUid,
              category: 'image',
              mime: mimeInfo.mime,
              extra: mImgSize,
              folder: 'f:' + fldName,
              filename: f,
              basename: fPathObj.name,
              filesize: s.size
            }

            // Generate thumbnail

            return fs.statAsync(cacheThumbnailPathStr).then((st) => {
              return st.isFile()
            }).catch((err) => { // eslint-disable-line handle-callback-err
              return false
            }).then((thumbExists) => {
              return (thumbExists) ? mData : fs.ensureDirAsync(cacheThumbnailPath.dir).then(() => {
                return self.generateThumbnail(fPath, cacheThumbnailPathStr)
              }).return(mData)
            })
          })
        }
      }

      // Other Files

      return {
        _id: fUid,
        category: 'binary',
        mime: mimeInfo.mime,
        folder: 'f:' + fldName,
        filename: f,
        basename: fPathObj.name,
        filesize: s.size
      }
    })
  },

  generateThumbnail (sourcePath, destPath) {
    return jimp.read(sourcePath).then(img => {
      return img
        .contain(150, 150)
        .write(destPath)
    })
  },

  getImageSize (sourcePath) {
    return imageSize(sourcePath)
  }
}
