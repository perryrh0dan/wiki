const express = require('express')
const _ = require('lodash')

const profileRoutes = express.Router()

profileRoutes.route('').get(function (req, res, next) {
  return res.status(200).send(req.user)
})

profileRoutes.route('').post(async function(req, res, next) {
  // check if user is logged in
  if (!req.user) {
    return res.status(401).send()
  }

  const user = await global.db.User.findById(req.user._id)
  user.name = req.body.name

  if (req.body.password) {
    let nPwd = _.trim(req.body.password)
    if (nPwd.length < 6) {
      return res.status(400).json({
        msg: 'new password is too short'
      })
    } else {
      let pwd = await global.db.User.hashPassword(nPwd)
      user.password = pwd
    }
  }

  await user.save()

  return res.json({
    msg: 'OK',
    user: user
  })
})

profileRoutes.route('/settings').get(async function(req, res, next) {
  if (!req.user) {
    return res.status(401).send()
  }

  const user = await global.db.User.findById(req.user._id)

  return res.status(200).json(user.settings)
})

profileRoutes.route('/settings').post(async function (req, res, next) {
  if (!req.user) {
    return res.status(401).send()
  }

  const user = await global.db.User.findById(req.user._id)

  if (req.body) {
    user.settings = req.body;
    await user.save()
  }

  req.app.io.emit('updateuser')
  return res.status(200).send()
})

module.exports = profileRoutes
