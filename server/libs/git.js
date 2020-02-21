'use strict'

const gitP = require('simple-git/promise')
const Promise = require('bluebird')
const _ = require('lodash')
const URL = require('url')

module.exports = {
  _git: null,
  _url: '',
  _repo: {
    path: '',
    branch: 'master',
    exists: false
  },
  _signature: {
    email: 'wiki@wiki.com'
  },
  onReady: null,

  init() {
    let self = this

    self._git = gitP(global.entries._repoPath)

    if (global.appconfig.git) {
      // Set repo branch
      self._repo.branch = global.appconfig.git.branch || 'master'
      // Define signature
      self._signature.email = global.appconfig.git.serverEmail || 'wiki@wiki.com'
    }

    self.onReady = self._git.checkIsRepo()
      .then(isRepo => {
        return (!isRepo) ? self.initializeRepo() : true
      }).catch(error => {
        global.winston.error(error)
      })
    // .then(() => this.git.fetch());
    return self
  },

  initializeRepo() {
    let self = this

    global.winston.info('Initializing local repository...')
    self._git.init().then(() => {
      global.winston.info('Adding origin remote via HTTP/S')
      let urlObj = URL.parse(global.appconfig.git.url)

      if (global.appconfig.git.auth.type !== 'ssh') {
        urlObj.auth = global.appconfig.git.auth.username + ':' + global.appconfig.git.auth.password
      }

      self._url = URL.format(urlObj)

      let gitConfigs = [
        () => {
          return self._git.addConfig('user.name', 'Wiki')
        },
        () => {
          return self._git.addConfig('user.email', self._signature.email)
        },
        () => {
          return self._git.addConfig('http.sslVerify', _.toString(global.appconfig.git.auth.sslVerify))
          return self._git.exec('config', ['--local', '--bool', 'http.sslVerify', _.toString(global.appconfig.git.auth.sslVerify)])
        }
      ]

      if (global.appconfig.git.auth.type === 'ssh') {
        gitConfigs.push(() => {
          return self._git.raw(['config', '--local', 'core.sshCommand', 'ssh -i "' + global.appconfig.git.auth.privateKey + '" -o StrictHostKeyChecking=no'])
        })
      }

      return self._git.getRemotes().then(remotes => {
        return Promise.each(gitConfigs, fn => {
          return fn()
        }).then(() => {
          if (!remotes.includes('origin')) {
            return self._git.raw(['remote', 'add', 'origin', self._url])
          } else {
            return self._git.raw(['remote', 'set-url', 'origin', self._url])
          }
        }).catch(err => {
          global.winston.error(err)
        })
      })
    }).catch(err => {
      global.winston.error('Git remote error!')
      throw err
    }).then(() => {
      global.winston.info('Git repository initialized')
      return true
    })
  },

  push() {
    let self = this

    global.winston.info('Start pushing to git repository')
    return self._git.add('./*').then(() => {
      return self._git.commit('wiki backup').then(() => {
        return self._git.push('origin', 'master').then(() => {
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
