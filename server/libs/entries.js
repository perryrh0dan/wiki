const Promise = require('bluebird')
const path = require('path')
const fs = Promise.promisifyAll(require('fs-extra'))
const _ = require('lodash')
const klaw = require('klaw')

const entryHelper = require('../helpers/entry')

module.exports = {
  _repoPath: 'repo',

  init() {
    let self = this

    self._repoPath = path.resolve(global.appRoot, global.appconfig.paths.repo)
    global.appdata.repoPath = self._repoPath

    //TODO check if path exists

    return self
  },

  scan() {
    let self = this
    let promises = []

    global.winston.info('Starting initial document scan')
    klaw(self._repoPath, {
        filter: pathItem => {
          return !pathItem.endsWith('.git')
        }
      })
      .on('data', function (item) {
        if (
          path.extname(item.path) === '.md' &&
          path.basename(item.path) !== 'README.md'
        ) {
          let entryPath = entryHelper.parsePath(
            entryHelper.getEntryPathFromFullPath(item.path)
          )
          promises.push(
            self.update(entryPath, {
              updateTree: false,
              updateChilds: false
            })
          )
        }
      })
      .on('end', () => {
        Promise.all(promises).then(() => {
          global.winston.info('Finished initial document scan')
          self.updateTreeInfo()
        })
      })
  },

  async update(entryPath, options) {
    const self = this

    const fpath = entryHelper.getFullPath(entryPath)

    options = _.defaults(options, {
      updateTree: true,
      updateChilds: true
    })

    let data
    try {
      data = await fs.readFile(fpath, 'utf8')
    } catch (error) {
      Promise.reject(error)
    }

    let parentPromise = self
      .getParentInfo(entryPath)
      .then(parentData => {
        return parentData
      })
      .catch(err => { // eslint-disable-line handle-callback-err
        return false
      })
    let parentPath = _.chain(entryPath)
      .split('/')
      .initial()
      .join('/')
      .value()

    const pData = await parentPromise
    let meta = global.mark.parseMeta(data)
    let tree = global.mark.parseTree(data)
    // insert correct host for images
    let content = data.replace(
      /(!\[.*?\]\()(.*?\/uploads)(\/.*?\))/g,
      '$1' + global.appconfig.backend + '/api/uploads$3'
    )
    // insert correct host for documents
    content = content.replace(
      /(\[.*?\]\()(.*?\/document)(\/.*?\))/g,
      '$1' + global.appconfig.frontend + '/document$3'
    )

    const updatedEntry = await global.db.Document.findOneAndUpdate({
      _id: entryPath
    }, {
      _id: entryPath,
      title: meta.title || entryPath,
      subtitle: meta.subtitle,
      content: content,
      author: meta.author,
      tree: tree,
      parentTitle: pData ? pData.title : '',
      parentPath: parentPath || '',
      tags: meta.tags,
      isEntry: true
    }, {
      upsert: true,
      new: true,
      runValidators: true
    })

    let updateChildProcessor = options.updateChilds ?
      self.updateChildInfo(entryPath, meta.title) :
      Promise.resolve('')

    await updateChildProcessor
    global.winston.debug(
      'Added { title:' +
      meta.title +
      ', path:' +
      entryPath +
      ' } to Database'
    )

    await global.search.addEntry(updatedEntry)
    let updateTreeProcessor = options.updateTree ? self.updateTreeInfo() : Promise.resolve('')

    await updateTreeProcessor
    Promise.resolve()
  },

  async addDocument(entryPath, user, template) {
    const self = this

    const entry = await global.db.Document.findOne({
      _id: entryPath
    })
    if (!entry || entry.isEntry === false) {
      const filepath = (global.appRoot + '/repo/' + entryPath.toLowerCase() + '.md')
      const content = await self.getStarter(entryPath, user, template)

      await fs.outputFileAsync(filepath, content)
      await self.update(entryPath)
      return global.db.Document.findOneAndUpdate({
        _id: entryPath
      }, {
        updatedBy: user.email,
        updatedAt: Date()
      })
    } else {
      throw new Error('File already exists')
    }
  },

  async editDocument(file, content, user) {
    const self = this

    const fpath = entryHelper.getFullPath(file)
    await fs.writeFile(fpath, content, 'utf8')
    await self.update(file)
    if (user) {
      return global.db.Document.findOneAndUpdate({
        _id: file
      }, {
        updatedBy: user.email,
        updatedAt: Date()
      })
    }
  },

  async deleteDocument(file) {
    const self = this

    const filepath = entryHelper.getFullPath(file)

    try {
      await fs.unlink(filepath)
    } catch (error) {
      return global.winston.error(error)
    }

    try {
      global.search.removeEntry(file)
    } catch (error) {
      return global.winston.error(error)
    }

    const dentry = await global.db.Document.findOne({
      _id: file
    })
    const parentPath = dentry.parentPath
    await global.db.Document.updateMany({
      parentPath: file
    }, {
      parentTitle: ''
    })

    await global.db.Document.deleteOne({
      _id: file
    })

    try {
      await self.deleteFavorites(file)
    } catch (error) {
      global.winston.error(error)
    }

    if (parentPath && !dentry.isDirectory) {
      try {
        await self.checkParentAndDelete(parentPath)
      } catch (error) {
        global.winston.error(error)
      }
    }

    try {
      await self.updateTreeInfo()
    } catch (error) {
      global.winston.error(error)
    }
  },

  checkParentAndDelete(parentPath) {
    let self = this

    return global.db.Document.find({
      parentPath: parentPath
    }).then(documents => {
      if (documents.length <= 0) {
        return global.db.Document.findOne({
          _id: parentPath
        }).then(parent => {
          let dirpath = self._repoPath + '/' + parent._id
          return fs.rmdir(dirpath).then(() => {
            if (parent && !parent.isEntry) {
              return parent.delete().then(() => {
                return this.checkParentAndDelete(parent.parentPath)
              })
            } else if (parent) {
              parent.isDirectory = false
              return parent.save()
            }
          })
        })
      }
    })
  },

  deleteFavorites(path) {
    return global.db.Favorite.deleteMany({
      document: path
    })
  },

  async moveDocument(oldfile, newfile) {
    let self = this

    const entry = await global.db.Document.findOne({
      _id: newfile
    })
    if (!entry || entry.isEntry === false) {
      const newfilepath = entryHelper.getFullPath(newfile.replace(/^\/|\/$/g, ''))

      const oldEntry = await global.db.Document.findOne({
        _id: oldfile
      })

      try {
        await fs.outputFileAsync(newfilepath, oldEntry.content)
      } catch (error) {
        global.winston.error(error)
      }

      try {
        await self.update(newfile)
      } catch (error) {
        global.winston.error(error)
      }

      try {
        await self.deleteDocument(oldfile)
      } catch (error) {
        global.winston.error(error)
      }

      // Update all links that head to the old document
      const documents = await global.db.Document.find({})
      const oldRoute = global.appconfig.frontend + '/' + 'document' + '/' + oldfile
      const newRoute = global.appconfig.frontend + '/' + 'document' + '/' + newfile
      const re = new RegExp(`(${oldRoute})`)

      const promises = []
      documents.forEach(document => {
        if (re.test(document.content)) {
          const newContent = document.content.replace(re, newRoute)
          promises.push(self.editDocument(document._id, newContent))
        }
      })

      return Promise.all(promises).then(
        () => {
          return Promise.resolve()
        }, error => {
          global.winston.error(error)
        })
    } else {
      throw new Error('File already exists')
    }
  },

  getStarter(entryPath, author, template) {
    let formattedTitle = _.startCase(_.last(_.split(entryPath, '/')))
    let file = 'create.md'
    if (template) {
      file = template + '.md'
    }

    return fs
      .readFileAsync(path.join(global.appRoot, 'config/' + file), 'utf8')
      .then(contents => {
        return _.replace(
          _.replace(contents, new RegExp('{AUTHOR}', 'g'), author),
          new RegExp('{TITLE}', 'g'),
          formattedTitle
        )
      })
  },

  async getParentInfo(entryPath) {
    if (_.includes(entryPath, '/')) {
      const parentParts = _.initial(_.split(entryPath, '/'))
      const parentPath = _.join(parentParts, '/')
      const parentFile = _.last(parentParts)
      const fpath = entryHelper.getFullPath(parentPath)

      const st = await fs.statAsync(fpath)
      if (st.isFile()) {
        const content = await fs.readFileAsync(fpath, 'utf8')
        const pageMeta = global.mark.parseMeta(content)

        return {
          path: parentPath,
          title: pageMeta.title ? pageMeta.title : _.startCase(parentFile),
          subtitle: pageMeta.subtitle ? pageMeta.subtitle : '',
          author: pageMeta.author ? pageMeta.author : '',
          tags: pageMeta.tags ? pageMeta.tags : []
        }
      } else {
        throw new Error('Parent is invalid')
      }
    } else {
      throw new Error('Parent is root')
    }
  },

  getFromTree(basePath, usr) {
    return global.db.Document.find({
          parentPath: basePath
        },
        'title parentPath isDirectory isEntry'
      )
      .sort({
        title: 'asc'
      })
      .then(results => {
        return _.filter(results, r => {
          return global.rights.checkRole('/documents/' + r._id, usr.rights, 'read')
        })
      })
  },

  updateChildInfo(entryPath, title) {
    return global.db.Document.updateMany({
      parentPath: entryPath
    }, {
      parentTitle: title
    }).then(
      () => {
        global.winston.debug('Updated all children')
      },
      error => {
        global.winston.error(error)
      }
    )
  },

  updateTreeInfo() {
    let self = this

    global.winston.info('Starting tree update')
    return global.db.Document.distinct('parentPath', {
      parentPath: {
        $ne: ''
      }
    })
      .then(allPaths => {
        if (allPaths.length > 0) {
          allPaths = self.determineMissingpath(allPaths)
          return Promise.map(allPaths, pathItem => {
            let parentPath = _.chain(pathItem)
              .split('/')
              .initial()
              .join('/')
              .value()
            let guessedTitle = _.chain(pathItem)
              .split('/')
              .last()
              .startCase()
              .value()
            return global.db.Document.updateOne({
              _id: pathItem
            }, {
              $set: {
                isDirectory: true
              },
              $setOnInsert: {
                isEntry: false,
                title: guessedTitle,
                parentPath
              }
            }, {
              upsert: true
            })
          })
        } else {
          return true
        }
      })
      .then(() => {
        global.winston.info('Finished tree update successfull')
      })
  },

  determineMissingpath(paths) {
    let allPaths = paths

    paths.forEach(path => {
      this.checkPathExists(allPaths, path)
    })

    return allPaths
  },

  checkPathExists(allPaths, path) {
    let parentPathArr = path.split('/')
    parentPathArr.pop()
    let parentPath = parentPathArr.join('/')

    if (parentPath !== '' && !allPaths.includes(parentPath)) {
      allPaths.push(parentPath)
      return this.checkPathExists(allPaths, parentPath)
    } else {
      return allPaths
    }
  },

  getStatistic() {
    let info = {
      entries: 0
    }

    return global.db.Document.find({}).then(entries => {
      info.entries = entries.length
      return info
    })
  }
}
