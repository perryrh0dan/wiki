'use strict'

const gitP = require('simple-git/promise')
const _ = require('lodash')

module.exports = {
  git: null,

  init () {
    this.git = gitP(global.entries._repoPath)
    // this.git.checkIsRepo()
    //     .then(isRepo => {
    //         !isRepo && initialiseRepo()
    //     }, error => {
    //         console.log(error)
    //     })
    //     .then(() => this.git.fetch());
    return this
  },

  initialiseRepo () {
    global.winston.info('Initializing local repository...')
    this.git.init().then(() => {
      global.winston.info('Adding origin remote via HTTP/S')
      let originUrl = ''
      if (_.startsWith(global.appconfig.git.url, 'http')) {
        originUrl = originUrl.replace('://', `://${global.appconfig.git.auth.username}:${global.appconfig.git.auth.password}@`)
      } else {
        originUrl = `https://${global.appconfig.git.auth.username}:${global.appconfig.git.auth.password}@${global.appconfig.git.url}`
      }
      this.git.addRemote('origin', originUrl)
    })
  },

  push () {
    global.winston.info('Start pushing to git repository')
    return this.git.add('./*').then(() => {
      return this.git.commit('wiki backup').then(() => {
        return this.git.push('origin', 'master').then(() => {
          global.winston.info('Finished git push successfull')
        }).catch(error => {
          global.winston.error(error)
        })
      }).catch(error => {
        global.winston.error(error)
      })
    }).catch(error => {
      global.winston.error(error)
    })
  }
}
