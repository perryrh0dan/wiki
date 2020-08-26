const express = require("express");
const validator = require('validator')
const _ = require('lodash')

const roleRoutes = express.Router();

/**
 * Get roles
 */
roleRoutes.get('/roles', (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send()
  }

  global.db.Role.find({}).then(roles => {
    res.status(200).send(roles)
  })
})

/**
 * Get role
 */

roleRoutes.get('/roles/:id', (req, res) => {
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
 * Create role
 */
roleRoutes.post('/roles', (req, res) => {
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

/**
 * Edit role
 */
roleRoutes.post('/roles/:id', (req, res) => {
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
 * Delete role
 */
roleRoutes.delete('/roles/:id', (req, res) => {
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

module.exports = roleRoutes
