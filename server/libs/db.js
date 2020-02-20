// Load modules
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

module.exports = {
  init() {
    let self = this

    let dbModelsPath = path.join(global.appRoot, 'models')

    mongoose.Promise = require('bluebird')

    // Event handlers
    mongoose.connection.on('error', err => {
      global.winston.error('Failed to connect to MongoDB instance.')
      return err
    })
    mongoose.connection.once('open', function () {
      global.winston.info('Connected to MongoDB instance.')
    })

    // Store connection handle
    self.connection = mongoose.connection
    self.ObjectId = mongoose.Types.ObjectId

    // Load DB Models
    fs.readdirSync(dbModelsPath)
      .filter(function (file) {
        return (file.indexOf('.') !== 0)
      })
      .forEach(function (file) {
        let modelName = _.upperFirst(_.camelCase(_.split(file, '.')[0]))
        self[modelName] = require(path.join(dbModelsPath, file))
      })

    // Connect
    global.winston.info(`Connecting to MongoDB instance: ${global.appconfig.db}`)
    self.onReady = mongoose.connect(global.appconfig.db, {
      useNewUrlParser: true
    })

    return self
  }
}
