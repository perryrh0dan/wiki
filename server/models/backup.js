'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var BackupSchema = new Schema({
  user: {
    type: String
  },
  date: {
    type: Date,
    index: true
  }
})

module.exports = mongoose.model('Backup', BackupSchema)
