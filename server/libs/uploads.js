'use strict'

const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))

module.exports = {
  _uploadsPath: './repo/uploads',

  init () {
    this._uploadsPath = path.resolve(global.appRoot, global.appconfig.paths.repo, 'uploads')
    this._uploadsThumbsPath = path.resolve(global.appRoot, global.appconfig.paths.data, 'thumbs')

    return this
  },

  getUploadsFolders () {
    return global.db.Uploadfolder.find({}).sort('name').exec().then((results) => {
      return results
    })
  },

  createUploadsFolder (name) {
    let validName = name.replace(/\//g, '')
    let folderPath = this._uploadsPath + '/' + validName

    return fs.mkdirp(folderPath).then(() => {
      return global.db.Uploadfolder.create({
        _id: 'f:' + validName,
        name: validName
      }).catch(error => {
        global.winston.error(error)
      })
    }).catch(error => {
      global.winston.error(error)
    })
  },

  getUploadsFiles (cat, fld) {
    return global.db.Upload.find({
      category: cat,
      folder: 'f:' + fld
    }).sort('filename').exec()
  },

  deleteUploadsFile (id) {
    return global.db.Upload.findById(id).then(entry => {
      return global.db.Upload.deleteOne({
        _id: id
      }).then(() => {
        const folder = entry.folder.length > 2 ? entry.folder.slice(2, entry.folder.length) + '/' : ''
        const filePath = this._uploadsPath + '/' + folder + entry.filename
        const thumbPath = this._uploadsThumbsPath + '/' + entry._id + '.png'
        return fs.unlink(filePath).then(() => {
          return fs.unlink(thumbPath)
        })
      })
    })
  },

  validateUploadsFolder (folderName) {
    return global.db.Uploadfolder.findOne({
      name: folderName
    }).then((f) => {
      return (f) ? path.resolve(this._uploadsPath, folderName) : false
    })
    // let self = this
    // return new Promise(function (resolve, reject) {
    //   let newpath = self._uploadsPath
    //   resolve(newpath)
    // })
  }
}