'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let UploadSchema = new Schema({

  _id: String,

  category: {
    type: String,
    required: true,
    default: 'binary'
  },
  mime: {
    type: String,
    required: true,
    default: 'application/octet-stream'
  },
  extra: {
    type: Object
  },
  folder: {
    type: String,
    ref: 'UploadFolder'
  },
  filename: {
    type: String,
    required: true
  },
  basename: {
    type: String,
    required: true
  },
  filesize: {
    type: Number,
    required: true
  }

}, {
  timestamps: {}
})

module.exports = mongoose.model('Upload', UploadSchema)
