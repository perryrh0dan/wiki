'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var FavoriteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId
  },
  document: {
    type: String,
    ref: 'Document'
  }
})

module.exports = mongoose.model('Favorite', FavoriteSchema)
