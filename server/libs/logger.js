'use strict'

const winston = require('winston')
require('winston-daily-rotate-file')

module.exports = (isDebug, processName) => {
  if (typeof processName === 'undefined') {
    processName = 'SERVER'
  }

  const appendProcess = winston.format.printf(({
    level,
    message,
    timestamp
  }) => {
    return `${timestamp} - ${processName}: [${level}] ${message}`
  })

  // Console and File
  let logger = winston.createLogger({
    level: (isDebug) ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
      appendProcess
    ),
    transports: [
      new winston.transports.Console({
        level: (isDebug) ? 'debug' : 'info',
        prettyPrint: true,
        colorize: true
      }),
      new winston.transports.DailyRotateFile({
        level: (isDebug) ? 'debug' : 'info',
        dirname: 'logs',
        filename: '%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
  })

  // External Services
  if (global.appconfig.externalLogging.papertrail.active) {
    require('winston-papertrail').Papertrail // eslint-disable-line no-unused-expressions
    logger.add(winston.transports.Papertrail, {
      host: global.appconfig.externalLogging.papertrail.host,
      port: global.appconfig.externalLogging.papertrail.port,
      level: global.appconfig.externalLogging.papertrail.level,
      program: 'wiki'
    })
  }

  return logger
}
