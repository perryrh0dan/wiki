'use strict'

// ----------------------------------------
// Config
// ----------------------------------------
const path = require('path')
global.appRoot = path.resolve(__dirname)
const IS_DEBUG = process.env.NODE_ENV === 'development'

let appconf = require('./libs/config')()
global.appconfig = appconf.config
global.appdata = appconf.data

// ----------------------------------------
// Load Winston
// ----------------------------------------
global.winston = require('./libs/logger')(IS_DEBUG, 'SERVER')
global.winston.info('Camelot Wiki is initializing...')

// ----------------------------------------
// Load global modules
// ----------------------------------------
global.lcdata = require('./libs/local').init()
global.db = require('./libs/db').init()
global.search = require('./libs/search').init()
global.upl = require('./libs/uploads').init()
global.uplAgent = require('./libs/uploads-agent').init()
global.entries = require('./libs/entries').init()
global.git = require('./libs/git').init()
global.mark = require('./libs/markdown')
global.users = []

// ----------------------------------------
// Load modules
// ----------------------------------------
const autoload = require('auto-load')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const passport = require('passport')
const passportSocketIo = require('passport.socketio')
const session = require('express-session')
const mongoStore = require('connect-mongo')(session)
const http = require('http')
const graceful = require('node-graceful')
const socketio = require('socket.io')

var mw = autoload(path.join(global.appRoot, '/middlewares'))
const ws = require('./controllers/ws')

const app = express()
// ----------------------------------------
// Passport Authentication
// ----------------------------------------
require('./libs/auth')(passport)
global.rights = require('./libs/rights')

let sessionStore = new mongoStore({ // eslint-disable-line
  mongooseConnection: global.db.connection,
  touchAfter: 15
})

app.use(cookieParser())
app.use(session({
  name: 'wiki',
  store: sessionStore,
  secret: global.appconfig.sessionSecret,
  resave: false,
  saveUninitialized: false
}))

// ----------------------------------------
// Passport
// ----------------------------------------
app.use(passport.initialize())
app.use(passport.session())

// ----------------------------------------
// Routes
// ----------------------------------------
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const documentRoutes = require('./routes/document')
const uploadRoutes = require('./routes/upload')
const adminRoutes = require('./routes/admin')
const homeRoutes = require('./routes/home')

app.use(bodyParser.json())
app.use(
  cors({
    origin: [global.appconfig.frontend],
    credentials: true
  })
)

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/documents', mw.auth, documentRoutes)
app.use('/api/uploads', mw.auth, uploadRoutes)
app.use('/api/admin', mw.auth, adminRoutes)
app.use('/api/home', mw.auth, homeRoutes)

// ----------------------------------------
// Start Server
// ----------------------------------------
var server = http.createServer(app)
var io = socketio(server, {
  path: '/api/socket.io'
})
app.io = io

server.listen(global.appconfig.port, '0.0.0.0')

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  // handle specific listen errors
  switch (error.code) {
    case 'EACCES':
      global.winston.error('Listening on port ' + global.appconfig.port + ' requires elevated privileges!')
      return process.exit(1)
    case 'EADDRINUSE':
      global.winston.error('Port ' + global.appconfig.port + ' is already in use!')
      return process.exit(1)
    default:
      throw error
  }
})

server.on('listening', () => {
  global.winston.info('HTTP server started successfully! [RUNNING]')
})

// ----------------------------------------
// Start file and upload scan and upload Agent
// ----------------------------------------
Promise.all([global.db.onReady, global.search.onReady, global.git.onReady]).then(() => {
  global.entries.scan()
}).then(() => {
  global.uplAgent.initialScan()
}).catch((error) => {
  global.winston.error(error.message, '')
  process.exit()
})

// ----------------------------------------
// WebSocket
// ----------------------------------------
global.socket = io.use(passportSocketIo.authorize({
  key: 'wiki',
  store: sessionStore,
  secret: global.appconfig.sessionSecret,
  cookieParser,
  success: (data, accept) => {
    accept()
  },
  fail: (data, message, error, accept) => {
    accept()
  }
}))

io.on('connection', ws)

// ----------------------------------------
// Graceful shutdown
// ----------------------------------------
graceful.on('exit', () => {
  global.winston.info('- SHUTTING DOWN - Terminating Background Agent...')
  global.winston.info('- SHUTTING DOWN - Now safe to exit.')
  process.exit()
})
