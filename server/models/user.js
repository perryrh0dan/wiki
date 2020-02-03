const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

let UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  password: {
    type: String
  },
  name: {
    type: String
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  settings: Object,
  authenticators: [{
    fmt: {
      type: String
    },
    publicKey: {
      type: String
    },
    credID: {
      type: String
    },
    counter: {
      type: Number
    },
    createdAt: {
      type: Date
    }
  }]
}, {
  timestamps: {}
})

UserSchema.statics.hashPassword = (rawPwd) => {
  return bcrypt.hash(rawPwd, 12)
}

UserSchema.methods.validatePassword = function (rawPwd) {
  return bcrypt.compare(rawPwd, this.password).then((isValid) => {
    return (isValid) ? true : Promise.reject() // eslint-disable-line
  })
}

module.exports = mongoose.model('User', UserSchema)
