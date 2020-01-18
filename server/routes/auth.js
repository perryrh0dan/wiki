const express = require('express')
const passport = require('passport')

// webAuthn
const utils = require('../libs/utils')
const base64url = require('base64url')

const authRoutes = express.Router()

authRoutes.route('/login').post(function (req, res, next) {
  passport.authenticate('local', {
    session: false
  }, (err, user, next, info) => {
    if (err || !user) return res.status(400).send('error')
    req.login(user, (err) => {
      if (err) return res.status(400).send(err)
      return res.status(200).send(user)
    })
  })(req, res, next)
})

authRoutes.post('/webauthn/login', async (req, res) => {
  if (!req.body || !req.body.username) {
    res.status(400).json({
      'status': 'failed',
      'message': 'Request missing username field!'
    })

    return
  }

  let username = req.body.username

  const user = await global.db.User.findOne({
    email: username
  })

  if (!user) {
    return res.status(400).json({
      msg: 'User not found'
    })
  }

  let getAssertion
  try {
    getAssertion = utils.generateServerGetAssertion(user.authenticators)
  } catch (error) {
    global.winston.error(error)
  }

  getAssertion.status = 'ok'

  req.session.challenge = getAssertion.challenge
  req.session.username = username

  res.json(getAssertion)
})

authRoutes.post('/webauthn/response', async (req, res) => {
  if (!req.body || !req.body.id ||
    !req.body.rawId || !req.body.response ||
    !req.body.type || req.body.type !== 'public-key') {
    return res.status(400).json({
      'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
    })
  }

  let webauthnResp = req.body
  let clientData = JSON.parse(base64url.decode(webauthnResp.response.clientDataJSON))

  /* Check challenge... */
  if (clientData.challenge !== req.session.challenge) {
    global.winston.debug('Challenges don\'t match')
    return res.status(400).json({
      'message': 'Challenges don\'t match!'
    })
  }

  /* ...and origin */
  if (clientData.origin !== global.appconfig.backend && clientData.origin !== 'http://localhost:4200') {
    global.winston.debug('Origins don\'t match!')
    return res.status(400).json({
      'message': 'Origins don\'t match!'
    })
  }

  let result

  const user = await global.db.User.findOne({
    email: req.session.username
  }).populate('roles')

  if (!user) {
    return res.status(400).json({
      msg: 'User not found'
    })
  }

  if (webauthnResp.response.authenticatorData !== undefined) {
    /* This is get assertion */
    try {
      result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, user.authenticators)
    } catch (err) {
      global.winston.error(err)
      return res.status(400).send(err)
    }

    if (result.verified) {
      req.login(user, (err) => {
        user.password = ''
        if (err) return res.status(400).send(err)
        return res.status(200).send(user)
      })
    } else {
      return res.status(500).json({
        'msg': 'Can not authenticate signature!'
      })
    }
  } else {
    return res.status(500).json({
      'msg': 'Wrong response type'
    })
  }
})

authRoutes.route('/profile').get(function (req, res, next) {
  return res.status(200).send(req.user)
})

authRoutes.route('/logout').post(function (req, res, next) {
  req.logout()
  res.status(200).send()
})

module.exports = authRoutes
