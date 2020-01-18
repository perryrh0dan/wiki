'use strict'
module.exports = (req, res, next) => {
  // Is user authenticated ?

  if (!req.isAuthenticated()) {
    return res.status(401).send()
  }

  // Check permissions
  res.locals.rights = global.rights.check(req)

  // Expose user data
  res.locals.user = req.user

  return next()
}
