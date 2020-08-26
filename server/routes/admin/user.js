const express = require("express");
const validator = require('validator')
const _ = require('lodash')

const userRoutes = express.Router();

/**
 * Get users
 */
userRoutes.get("/users", (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send();
  }

  global.db.User.find({})
    .select("-password")
    .sort("email")
    .exec()
    .then(usrs => {
      res.status(200).send(usrs);
    });
});

/**
 * Get user
 */
userRoutes.get("/users/:id", (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send();
  }

  if (!validator.isMongoId(req.params.id)) {
    return res.status(400).send();
  }

  global.db.User.findById(req.params.id)
    .select("-password")
    .exec()
    .then(usr => {
      res.status(200).send(usr);
    })
    .catch(err => {
      return res.status(404).end(err) || true;
    });
});

/**
 * Create user
 */
userRoutes.post("/users", (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send();
  }

  let nUsr = {
    email: _.toLower(_.trim(req.body.user.email)),
    password: req.body.user.password,
    name: req.body.user.name
  };

  global.db.User.findOne({
    email: nUsr.email
  })
    .then(exUsr => {
      if (exUsr) {
        return (
          res.status(400).json({
            msg: "User already exists!"
          }) || true
        );
      }

      global.db.User.hashPassword(nUsr.password)
        .then(nPwd => {
          nUsr.password = nPwd;

          return global.db.User.create(nUsr).then(user => {
            return res.status(200).send(user);
          });
        })
        .catch(err => {
          global.winston.warn(err);
          return res.status(500).json({
            msg: err
          });
        });
    })
    .catch(err => {
      global.winston.warn(err);
      return res.status(500).json({
        msg: err
      });
    });
});

/**
 * Edit user
 */
userRoutes.post("/users/:id", (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send();
  }

  if (!validator.isMongoId(req.params.id)) {
    return res.status(400).send({
      msg: "invalid userid"
    });
  }

  return global.db.User.findById(req.params.id).then(usr => {
    usr.name = req.body.user.name;
    usr.roles = req.body.user.roles;

    global.db.User.findOne({
      email: usr.email
    }).then(exUsr => {
      if (exUsr && exUsr.id !== req.params.id) {
        return (
          res.status(400).send({
            msg: "User already exists!"
          }) || true
        );
      }

      return new Promise(function(resolve, reject) {
        if (req.body.user.password) {
          let nPwd = _.trim(req.body.user.password);
          if (nPwd.length < 6) {
            reject(new Error("new password is too short"));
          } else {
            return global.db.User.hashPassword(nPwd).then(pwd => {
              usr.password = pwd;
              resolve(usr.save());
            });
          }
        } else {
          resolve(usr.save());
        }
      })
        .then(usr => {
          req.app.io.emit("updateuser");
          return res.json({
            msg: "OK",
            user: usr
          });
        })
        .catch(err => {
          res.status(400).json({
            msg: err.message
          });
        });
    });
  });
});

/**
 * Delete user
 */
userRoutes.delete("/users/:id", (req, res) => {
  if (!res.locals.rights.manage) {
    return res.status(403).send();
  }

  if (!validator.isMongoId(req.params.id)) {
    return res.status(400).json({
      msg: "invalid userid"
    });
  }

  return global.db.User.findByIdAndRemove(req.params.id)
    .then(() => {
      return res.json({
        ok: true
      });
    })
    .catch(err => {
      res.status(500).json({
        ok: false,
        msg: err.message
      });
    });
});

module.exports = userRoutes;
