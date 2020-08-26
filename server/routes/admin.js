const express = require('express')
const validator = require('validator')
const _ = require('lodash')
const os = require('os')
const filesize = require('filesize')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const zlib = require('zlib')

// webAuthn
const utils = require('../libs/utils')
const base64url = require('base64url')

// routes
const userRoutes = require('./admin/user')
const roleRoutes = require('./admin/role')

const adminRoutes = express.Router()

adminRoutes.use(userRoutes)
adminRoutes.use(roleRoutes)

/**
 * Register authenticator
 */
adminRoutes.post('/users/authenticator/register', async (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  if (!req.body || !req.body.userID) {
    return res.status(400).json({
      'status': 'failed',
      'message': 'Request missing name or username field!'
    })
  }

  const userId = req.body.userID

  const user = await global.db.User.findById(userId)

  if (!user) {
    return res.status(400).json({
      msg: 'User not found'
    })
  }

  let challengeMakeCred = utils.generateServerMakeCredRequest(user.email, user.name, user._id)
  challengeMakeCred.status = 'ok'

  req.session.challenge = challengeMakeCred.challenge
  req.session.username = user.email

  res.json(challengeMakeCred)
})

/**
 * Response to webAuthn
 */
adminRoutes.post('/users/authenticator/response', async (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  if (!req.body || !req.body.id ||
    !req.body.rawId || !req.body.response ||
    !req.body.type || req.body.type !== 'public-key') {
    return res.json({
      'status': 'failed',
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
  if (clientData.origin !== global.appconfig.backend && clientData.origin !== global.appconfig.frontend) {
    global.winston.debug('Origins don\'t match!')
    return res.status(400).json({
      'message': 'Origins don\'t match!'
    })
  }

  let result

  const user = await global.db.User.findOne({
    email: req.session.username
  }).populate('roles')

  if (webauthnResp.response.attestationObject !== undefined) {
    /* This is create cred */
    result = utils.verifyAuthenticatorAttestationResponse(webauthnResp)

    if (result.verified) {
      result.authrInfo.createdAt = new Date()
      user.authenticators.push(result.authrInfo)
      user.save().then(() => {
        return res.status(200).send()
      })
    }
  } else {
    return res.status(500).json({
      'msg': 'Wrong response type'
    })
  }
})

/**
 * Unregister authenticator
 */
adminRoutes.post('/users/authenticator/unregister', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  const userID = req.body.userID
  const credID = req.body.credID

  global.db.User.findById(userID).then(user => {
    const newAuthenticators = user.authenticators.filter(x => x.credID !== credID)
    user.authenticators = newAuthenticators
    return user.save().then(() => {
      return res.status(200).send()
    }).catch(error => {
      global.winston.error(error)
    })
  }).catch(error => {
    global.winston.error(error)
    return res.status(404).json({
      msg: 'User not found'
    })
  })
})

/**
 * Status info
 */
adminRoutes.get('/statistic', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  let stats = {}

  global.entries.getStatistic().then(entriesStatus => {
    return global.db.User.countDocuments().then(userCounter => {
      stats.entries = entriesStatus
      stats.users = {
        users: userCounter
      }
      res.status(200).send(stats)
    }).catch(err => {
      global.winsto.warn(err)
      res.status(400).json({
        msg: 'Error occurred'
      })
    })
  }).catch(err => {
    global.winston.warn(err)
    res.status(400).json({
      msg: 'Error occurred'
    })
  })
})

/**
 * System info
 */
adminRoutes.get('/system', async (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  const sessions = await global.db.Session.find({})

  let hostInfo = {
    cpus: os.cpus(),
    hostname: os.hostname(),
    nodeversion: process.version,
    os: `${os.type()} (${os.platform()}) ${os.release()} ${os.arch()}`,
    totalmem: filesize(os.totalmem()),
    cwd: process.cwd()
  }

  let liveInfo = {
    sessions: sessions.length
  }

  global.db.Backup.find({}).sort({
    date: -1
  }).limit(1).then(backup => {
    return res.status(200).json({
      hostinfo: hostInfo,
      liveinfo: liveInfo,
      backup: backup[0]
    })
  })
})

/**
 * Kill all sessions
 */
adminRoutes.post('/system/sessions/kill', async (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  await global.db.Session.remove({})

  return res.status(200).send()
})

/**
 * Git backup
 */
adminRoutes.post('/system/backup', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  global.git.push().then(() => {
    global.db.Backup.create({
      user: req.user.email,
      date: Date()
    }).then(() => {
      res.status(200).send()
    })
  }, error => {
    res.status(500).send(error)
  })
})

/**
 * Get Logs
 */
adminRoutes.get('/logs', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  const logPath = global.appRoot + '/logs'
  fs.readdir(logPath).then(files => {
    res.status(200).json({
      files: files
    })
  })
})

/**
 * Get Log by ID
 */
adminRoutes.get('/logs/:id', async (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  const logPath = global.appRoot + '/logs/' + req.params.id
  if (await fs.exists(logPath) === false) {
    global.winston.error(`Unable to find file: logPath`)
    return res.status(400).json({ msg: 'Unable to find log file' })
  }

  const inp = fs.createReadStream(logPath)

  if (req.params.id.includes('.gz')) {
    const gunzip = zlib.createGunzip()

    inp.pipe(gunzip)
    var buffer = []

    gunzip.on('data', function (data) {
      // decompression chunk ready, add it to the buffer
      buffer.push(data.toString())
    }).on('end', function () {
      // response and decompression complete, join the buffer and return
      const result = buffer.toString()
      res.status(200).send(result)
    }).on('error', function (e) {
      res.status(500).send()
    })
  } else {
    inp.pipe(res)
  }
})

module.exports = adminRoutes
