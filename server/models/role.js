'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

var RoleSchema = new Schema({
  name: {
    type: String,
    index: true
  },
  rights: [{
    role: String,
    path: String,
    exact: Boolean,
    deny: Boolean
  }]

})

module.exports = mongoose.model('Role', RoleSchema)
