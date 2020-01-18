'use strict'

const _ = require('lodash')
const entryHelper = require('../helpers/entry')

module.exports = {
  check (req) {
    let self = this

    let perm = {
      read: false,
      write: false,
      manage: false
    }
    let rt = []
    let p = ''

    if (req.body && req.body.id) {
      p = '/documents/' + entryHelper.parsePath(req.body.id)
    } else {
      p = _.chain(req.originalUrl).toLower().trim().replace(/^\/(api|api\/edit|api\/create)/, '').value()
    }

    // Load user rights
    if (_.isArray(req.user.rights)) {
      rt = req.user.rights
    }

    // Check rights
    if (self.checkRole(p, rt, 'admin')) {
      perm.read = true
      perm.write = true
      perm.manage = true
    } else if (self.checkRole(p, rt, 'write')) {
      perm.read = true
      perm.write = true
    } else if (self.checkRole(p, rt, 'read')) {
      perm.read = true
    }

    return perm
  },

  checkRole (p, rt, role) {
    if (_.find(rt, {
        role: 'admin'
      })) {
      return true
    }

    // Check specific role on path

    let filteredRights = _.filter(rt, (r) => {
      if (r.role === role || (r.role === 'write' && role === 'read')) {
        if ((!r.exact && _.startsWith(p, r.path)) || (r.exact && p === r.path)) {
          return true
        }
      }
      return false
    })

    // Check for deny scenario

    let isValid = false

    if (filteredRights.length > 1) {
      isValid = !_.chain(filteredRights).sortBy((r) => {
        return r.path.length + ((r.deny) ? 0.5 : 0)
      }).last().get('deny').value()
    } else if (filteredRights.length === 1 && filteredRights[0].deny === false) {
      isValid = true
    }

    // Deny by default

    return isValid
  }
}
