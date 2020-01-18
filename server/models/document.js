const mongoose = require('mongoose')
const Schema = mongoose.Schema

let DocumentSchema = new Schema({
  _id: {
    type: String
  },
  title: {
    type: String,
    text: true,
    default: ''
  },
  subtitle: {
    type: String,
    text: true,
    default: ''
  },
  content: {
    type: String,
    text: false,
    default: ''
  },
  tree: {
    type: []
  },
  author: {
    type: String,
    default: ''
  },
  parentTitle: {
    type: String,
    default: '',
    text: true
  },
  parentPath: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  isDirectory: {
    type: Boolean,
    default: false
  },
  isEntry: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date()
  },
  updatedBy: {
    type: String,
    default: 'admin'
  },
  updatedAt: {
    type: Date,
    default: Date()
  }
}).index({
  title: 'text',
  subtitle: 'text',
  parentTitle: 'text',
  content: 'text'
})

DocumentSchema.statics = {
  searchPartial: function (q, callback) {
    return this.find(
      {
        isEntry: true,
        $or: [
          {
            title: new RegExp(q, 'gi')
          },
          {
            subtitle: new RegExp(q, 'gi')
          },
          {
            parentTitle: new RegExp(q, 'gi')
          }
          // { "content": new RegExp(q, "gi") },
        ]
      },
      callback
    )
  },

  searchFull: function (q, callback) {
    return this.find(
      {
        isEntry: true,
        $text: {
          $search: q,
          $caseSensitive: false
        }
      },
      callback
    )
  },

  search: function (q, callback) {
    this.searchFull(q, (err, data) => {
      if (err) return callback(err, data)
      if (!err && data.length >= 5) return callback(err, data)
      if (!err && data.length < 5) return this.searchPartial(q, callback)
    })
  }
}

module.exports = mongoose.model('Document', DocumentSchema)
