'use strict'

const qs = require('querystring')
const _ = require('lodash')
const path = require('path')

module.exports = {
  parsePath (urlPath) {
    urlPath = qs.unescape(urlPath)
    let wlist = new RegExp('[^a-z0-9' + global.appdata.regex.cjk + global.appdata.regex.arabic + '/-]', 'g')

    urlPath = _.toLower(urlPath).replace(wlist, '')

    if (urlPath === '/') {
      urlPath = 'home'
    }

    let urlParts = _.filter(_.split(urlPath, '/'), (p) => {
      return !_.isEmpty(p)
    })

    return _.join(urlParts, '/')
  },

  getFullPath (entryPath) {
    return path.join(global.appdata.repoPath, entryPath + '.md')
  },

  getEntryPathFromFullPath (fullPath) {
    let absRepoPath = path.resolve(global.appRoot, global.appdata.repoPath)
    return _.chain(fullPath).replace(absRepoPath, '').replace('.md', '').replace(new RegExp('\\\\', 'g'), '/').value()
  }
}
