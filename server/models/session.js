const mongoose = require('mongoose')
const Schema = mongoose.Schema

let SessionSchema = new Schema({
  expires: {
    type: Date
  },
  lastModified: {
    type: Date
  },
  session: {
    type: String
  }
})

module.exports = mongoose.model('Session', SessionSchema)
