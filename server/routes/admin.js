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

const adminRoutes = express.Router()

/**
 * Get users
 */
adminRoutes.get('/users', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  global.db.User.find({})
    .select('-password')
    .sort('email')
    .exec().then((usrs) => {
      res.status(200).send(usrs)
    })
})

/**
 * Get user
 */
adminRoutes.get('/users/:id', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  if (!validator.isMongoId(req.params.id)) {
    return res.status(400).send()
  }

  global.db.User.findById(req.params.id)
    .select('-password')
    .exec().then((usr) => {
      res.status(200).send(usr)
    }).catch(err => {
      return res.status(404).end(err) || true
    })
})

/**
 * Create user
 */
adminRoutes.post('/users', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  let nUsr = {
    email: _.toLower(_.trim(req.body.user.email)),
    password: req.body.user.password,
    name: req.body.user.name
  }

  global.db.User.findOne({
    email: nUsr.email
  }).then(exUsr => {
    if (exUsr) {
      return res.status(400).json({
        msg: 'User already exists!'
      }) || true
    }

    global.db.User.hashPassword(nUsr.password).then(nPwd => {
      nUsr.password = nPwd

      return global.db.User.create(nUsr).then(user => {
        return res.status(200).send(user)
      })
    }).catch(err => {
      global.winston.warn(err)
      return res.status(500).json({
        msg: err
      })
    })
  }).catch(err => {
    global.winston.warn(err)
    return res.status(500).json({
      msg: err
    })
  })
})

/**
 * Edit user
 */
adminRoutes.post('/users/:id', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  if (!validator.isMongoId(req.params.id)) {
    return res.status(400).send({
      msg: 'invalid userid'
    })
  }

  return global.db.User.findById(req.params.id).then((usr) => {
    usr.name = req.body.user.name
    usr.roles = req.body.user.roles

    global.db.User.findOne({
      email: usr.email
    }).then(exUsr => {
      if (exUsr && exUsr.id !== req.params.id) {
        return res.status(400).send({
          msg: 'User already exists!'
        }) || true
      }

      return new Promise(function (resolve, reject) {
        if (req.body.user.password) {
          let nPwd = _.trim(req.body.user.password)
          if (nPwd.length < 6) {
            reject(new Error('new password is too short'))
          } else {
            return global.db.User.hashPassword(nPwd).then((pwd) => {
              usr.password = pwd
              resolve(usr.save())
            })
          }
        } else {
          resolve(usr.save())
        }
      }).then((usr) => {
        req.app.io.emit('updateuser')
        return res.json({
          msg: 'OK',
          user: usr
        })
      }).catch((err) => {
        res.status(400).json({
          msg: err.message
        })
      })
    })
  })
})

/**
 * Delete user
 */
adminRoutes.delete('/users/:id', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  if (!validator.isMongoId(req.params.id)) {
    return res.status(400).json({
      msg: 'invalid userid'
    })
  }

  return global.db.User.findByIdAndRemove(req.params.id).then(() => {
    return res.json({
      ok: true
    })
  }).catch((err) => {
    res.status(500).json({
      ok: false,
      msg: err.message
    })
  })
})

/**
 * Load roles
 */
adminRoutes.get('/roles', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  global.db.Role.find({}).then(roles => {
    res.status(200).send(roles)
  })
})

/**
 * Create role
 */
adminRoutes.post('/roles', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  let nRole = {
    name: _.trim(req.body.name)
  }

  if (!validator.isLength(nRole.name, {
    min: 2
  })) {
    return res.status(400).send({
      msg: 'Name is missing'
    })
  }

  global.db.Role.findOne({
    name: nRole.name
  }).then(exRole => {
    if (exRole) {
      return res.status(400).send({
        msg: 'Role already exists!'
      }) || true
    }

    nRole.rights = [{
      role: 'read',
      path: '/',
      exact: false,
      deny: false
    }]

    return global.db.Role.create(nRole).then(role => {
      return res.status(200).send(role)
    })
  }).catch(err => {
    global.winston.warn(err)
    return res.status(500).send({
      msg: err
    })
  })
})

adminRoutes.get('/roles/:id', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  if (!validator.isMongoId(req.params.id)) {
    return res.status(400).send({
      msg: 'invalid roleid'
    })
  }

  global.db.Role.findById(req.params.id).then(role => {
    if (!role) return res.status(400).send()
    res.status(200).send(role)
  })
})

/**
 * Delete role
 */
adminRoutes.delete('/roles/:id', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  if (!validator.isMongoId(req.params.id)) {
    return res.status(400).send({
      msg: 'invalid roleid'
    })
  }

  global.db.Role.findByIdAndRemove(req.params.id).then(() => {
    return res.json({
      ok: true
    })
  }).catch((err) => {
    res.status(500).send({
      ok: false,
      msg: err.message
    })
  })
})

/**
 * Edit role
 */
adminRoutes.post('/roles/:id', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  if (!validator.isMongoId(req.params.id)) {
    return res.status(400).json({
      msg: 'invalid roleid'
    })
  }

  global.db.Role.findById(req.params.id).then(role => {
    role.name = _.trim(req.body.role.name)
    role.rights = req.body.role.rights

    global.db.Role.findOne({
      name: role.name
    }).then(exRole => {
      if (exRole && exRole.id !== req.params.id) {
        return res.status(400).json({
          msg: 'Role already exists!'
        }) || true
      }
      role.save().then(() => {
        req.app.io.emit('updateuser')
        return res.json({
          msg: 'OK'
        })
      })
    })
  })
})

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
