'use strict'

const fs = require('fs')
const yaml = require('js-yaml')
const _ = require('lodash')
const path = require('path')

module.exports = (confPaths) => {
  confPaths = _.defaults(confPaths, {
    config: path.join(global.appRoot, 'config.yml'),
    data: path.join(global.appRoot, 'config/data.yml'),
    dataRegex: path.join(global.appRoot, 'config/regex.js')
  })

  let appconfig = {}
  let appdata = {}

  try {
    appconfig = yaml.safeLoad(
      fs.readFileSync(confPaths.config, 'utf8')
    )

    appdata = yaml.safeLoad(fs.readFileSync(confPaths.data, 'utf8'))
    appdata.regex = require(confPaths.dataRegex)
  } catch (ex) {
    console.error(ex)
    process.exit(1)
  }

  // Merge with defaults
  appconfig = _.defaultsDeep(appconfig, appdata.defaults.config)

  // Check port
  if (appconfig.port < 1) {
    appconfig.port = process.env.PORT || 80
  }

  return {
    config: appconfig,
    data: appdata
  }
}
