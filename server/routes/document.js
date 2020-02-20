const express = require("express");
const path = require("path");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs-extra"));

const entryHelper = require("../helpers/entry");

const documentRoutes = express.Router();
/**
 * Create document
 */
documentRoutes.route("/create").put(function(req, res, next) {
  if (!res.locals.rights.write) {
    return res.status(403).send({
      msg: "No write permissions for this directory"
    });
  }

  let safePath = entryHelper.parsePath(req.body.id);
  if (!safePath && safePath === "") {
    res.status(400).json({
      msg: "Wrong entry path"
    });
  }

  global.entries
    .addDocument(safePath, req.user.email, req.body.template)
    .then(() => {
      res.status(200).send({
        path: req.body.path
      });
    })
    .catch(err => {
      global.winston.error(err);
      res.status(500).send();
    });
});

/**
 * Edit document
 */
documentRoutes.route("/edit").post(function(req, res, next) {
  if (!res.locals.rights.write) {
    return res.status(403).send({
      msg: "No write permissions for this file"
    });
  }

  let safePath = req.body.id;

  global.entries
    .editDocument(safePath, req.body.content, req.user)
    .then(() => {
      res.status(200).send();
    })
    .catch(err => {
      global.winston.error(err);
      res.status(500).send();
    });
});

documentRoutes.route("/all").post(function(req, res, next) {
  global.entries
    .getFromTree(req.body.path, req.user)
    .then(results => {
      res.status(200).send(results);
    })
    .catch(err => {
      global.winston.error(err);
      res.status(500).send();
    });
});

/**
 * Search for documents
 */
documentRoutes.route("/search/:query").get(function(req, res, next) {
  if (!req.params.query || req.params.query.length <= 2) return;

  let query = req.params.query;
  global.search
    .searchEntry(query)
    .then(results => {
      res.status(200).send(results);
    })
    .catch(err => {
      global.winston.error(err);
      res.status(500).send()
    });
});

/**
 * Move document
 */
documentRoutes.route("/*").put(function(req, res, next) {
  if (!res.locals.rights.write) {
    return res.status(403).send({
      msg: "No write permissions for this file"
    });
  }

  let oldPath = entryHelper.parsePath(req.path);
  let newPath = entryHelper.parsePath(req.body.newpath);

  // check new path permissions
  if (
    !global.rights.checkRole(
      "/documents/" + newPath,
      res.locals.user.rights,
      "write"
    )
  ) {
    // to avoid redirect to home status code 400 instead of 403
    return res.status(400).send({
      msg: "No write permission for the destination path"
    });
  }

  global.entries
    .moveDocument(oldPath, newPath)
    .then(() => {
      res.status(200).send();
    })
    .catch(err => {
      global.winston.error(err);
      res.status(500).send();
    });
});

/**
 * Delete document in Markdown
 */
documentRoutes.route("/*").delete(function(req, res, next) {
  if (!res.locals.rights.write) {
    return res.status(403).send({
      msg: "No write permissions for this file"
    });
  }

  let safePath = entryHelper.parsePath(req.path);

  global.entries
    .deleteDocument(safePath)
    .then(() => {
      res.status(200).send();
    })
    .catch(err => {
      global.winston.error(err);
      res.status(500).send();
    });
});

/**
 * Get favorites
 */
documentRoutes.route("/favorites").get(function(req, res, next) {
  global.db.Favorite.find({
    user: res.locals.user._id
  })
    .select("-user")
    .populate("document")
    .then(favorites => {
      favorites.sort(function(a, b) {
        var textA = a.document.title.toUpperCase();
        var textB = b.document.title.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      res.status(200).send(favorites);
    })
    .catch(err => {
      global.winston.error(err);
      res.status(400).json({
        msg: "Error occurred"
      });
    });
});

/**
 * Mark as favorite
 */
documentRoutes.route("/favorites").post(function(req, res, next) {
  if (!res.locals.rights.read) {
    return res.status(403).send({
      msg: "No read permissions for this file"
    });
  }

  let safePath = entryHelper.parsePath(req.body.id);
  let currentUser = res.locals.user;

  global.db.User.findOne({
    _id: currentUser._id
  }).then(user => {
    if (!user) return res.status(404).send();
    // check if file is already in favorites

    return global.db.Favorite.findOne({
      user: currentUser._id,
      document: safePath
    })
      .then(favorite => {
        return new Promise(function(resolve, reject) {
          if (favorite) {
            return global.db.Favorite.deleteOne({
              _id: favorite._id
            })
              .then(() => {
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          } else {
            return global.db.Document.findOne({
              _id: safePath
            })
              .then(entry => {
                if (!entry) {
                  return res.status(404).json({
                    msg: "Document not found"
                  });
                }
                return global.db.Favorite.create({
                  user: currentUser._id,
                  document: entry._id
                })
                  .then(() => {
                    resolve();
                  })
                  .catch(err => {
                    reject(err);
                  });
              })
              .catch(err => {
                reject(err);
              });
          }
        })
          .then(() => {
            res.status(200).send();
          })
          .catch(err => {
            global.winston.error(err);
            res.status(400).send({
              msg: "Error Occurred"
            });
          });
      })
      .catch(err => {
        global.winston.error(err);
        res.status(400).send({
          msg: "Error Occurred"
        });
      });
  });
});

/**
 * Load document
 */
documentRoutes.route("/get").post(function(req, res, next) {
  if (!res.locals.rights.read) {
    return res.status(403).send({
      msg: "No read permissions for this file"
    });
  }

  let safePath = entryHelper.parsePath(req.body.id);
  let affectViews = req.body.affectViews;

  global.db.Document.findOne({
    _id: safePath
  }).then(entry => {
    if (!entry || !entry.isEntry) return res.status(404).send();

    return new Promise(function(resolve, reject) {
      if (!affectViews) return resolve(entry);
      entry.views += 1;
      return entry.save().then(uentry => {
        resolve(uentry);
      });
    })
      .then(uentry => {
        uentry = uentry.toObject();

        return global.db.Favorite.findOne({
          user: res.locals.user._id,
          document: safePath
        })
          .then(favorite => {
            if (!favorite) {
              uentry.favorite = false;
            } else {
              uentry.favorite = true;
            }
            uentry.write = res.locals.rights.write;
            return global.entries
              .getFromTree(uentry._id, res.locals.user)
              .then(children => {
                uentry.children = children;
                return res.status(200).send(uentry);
              })
              .catch(err => {
                global.winston.error(err);
                return res.status(500).send(err);
              });
          })
          .catch(err => {
            global.winston.error(err);
            return res.status(500).send(err);
          });
      })
      .catch(err => {
        global.winston.error(err);
        return res.status(500).send(err);
      });
  });
});

/**
 * Load Tags
 */
documentRoutes.route("/tags").get(async (req, res) => {
  const docs = await global.db.Document.find(
    {},
    {
      tags: 1
    }
  );

  const tags = [];

  docs.forEach(doc => {
    doc.tags.forEach(tag => {
      tags.push(tag);
    });
  });

  const uniq = [...new Set(tags)];

  return res.status(200).json(uniq);
});

/**
 * Load documents by tags
 */
documentRoutes.route("/tags/:tags").get(async (req, res, next) => {
  const tags = req.params.tags.split(",");

  const document = await global.db.Document.find({
    tags: {
      $all: tags
    }
  });

  return res.status(200).json(document);
});

/**
 * Load templates
 */
documentRoutes.route("/templates").get(async (req, res, next) => {
  fs.readdir(path.join(global.appRoot, "config")).then(files => {
    const templates = [];
    files.forEach(file => {
      if (file.includes(".md") && file !== "create.md") {
        templates.push(file.slice(0, file.length - 3));
      }
    });

    res.status(200).json({
      templates: templates
    });
  });
});

module.exports = documentRoutes;
