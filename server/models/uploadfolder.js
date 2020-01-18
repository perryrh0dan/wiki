'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var UploadFolderSchema = new Schema({

  _id: String,

  name: {
    type: String,
    index: true
  }

}, {
  timestamps: {}
})

module.exports = mongoose.model('UploadFolder', UploadFolderSchema)
