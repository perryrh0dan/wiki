'use strict'

const User = require('../models/user')

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function (id, done) {
    global.db.User.findById(id)
      .select('-password')
      .populate('roles')
      .exec(function (err, user) {
        if (!err && user) {
          let rights = []
          user.roles.forEach(role => {
            rights = rights.concat(role.rights)
          })
          user.rights = rights
        }
        done(err, user)
      })
  })

  const LocalStrategy = require('passport-local').Strategy
  passport.use('local',
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      session: false
    }, (username, password, done) => {
      User.findOne({
        email: username
      }).populate('roles').then(user => {
        if (user) {
          return user.validatePassword(password).then(() => {
            user.password = ''
            return done(null, user) || true
          }).catch((err) => {
            return done(err, null)
          })
        } else {
          return done(new Error('INVALID_LOGIN'), null)
        }
      }).catch((err) => {
        done(err, null)
      })
    }))

  global.db.onReady.then(() => {
    return User.find({}).then(users => {
      if (!users.length < 1) return true
      return User.create({
        email: global.appconfig.auth.defaultAdminEmail,
        password: '$2a$04$MAHRw785Xe/Jd5kcKzr3D.VRZDeomFZu2lius4gGpZZ9cJw7B7Mna' // admin123
      }).then(() => {
        global.winston.info('Root admin account created successfully')
        return global.db.Role.find({
          name: 'admin'
        }).then(roles => {
          if (!roles.length < 1) return true
          return global.db.Role.create({
            name: 'admin',
            rights: [{
              role: 'admin',
              path: '/',
              exact: false,
              deny: false
            }]
          }).then((role) => {
            global.winston.info('Admin role created successfully')
            return User.updateOne({
              email: global.appconfig.auth.defaultAdminEmail
            }, {
              roles: [role._id]
            }).then(() => {
              global.winston.info('Admin role assigned to admin user')
            })
          })
        }).catch((err) => {
          global.winston.error('An error occured while creatin admin role:')
          global.winston.error(err)
        })
      }).catch((err) => {
        global.winston.error('An error occured while creatin root admin account:')
        global.winston.error(err)
      })
    })
  })
}
