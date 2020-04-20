/*****************************************************************
 *
 * Copyright 2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *****************************************************************/

 var express = require('express'),
     extensions = require('./extensions'),
     cookieParser = require('cookie-parser'),
     log4js = require('log4js'),
     clientLogger = log4js.getLogger('client'), //client logger will log messages coming from client side javacript
     serverLogger = log4js.getLogger('server')

module.exports = function(app) {
  var router = express.Router();

  router.post('/log', logMessage)
  router.post('/logLevel', setLogLevel)

  //Extend the REST apis
  router = extensions.addRoutes(router)

  app.use('/extensions', express.json(), cookieParser(), router)
}

function logMessage(req, res) {
  const message = req.cookies['kappnav-user'] ? '['+req.cookies['kappnav-user']+'] ' + req.body.message
                                              : req.body.message
  const type = req.body.type

  if(type === 'error') {
    clientLogger.error(message)
  } else if(type === 'warn') {
    clientLogger.warn(message)
  } else if(type === 'info') {
    clientLogger.info(message)
  } else if(type === 'debug') {
    clientLogger.debug(message)
  } else {
    clientLogger.trace(message)
  }

  res.status(200).send({ success: true })
  res.end
}

function setLogLevel(req, res) {
  const level = req.body.level
  setConsoleLevel(level)

  res.status(200).send({ success: true })
  res.end
}

const setConsoleLevel = level => {
  serverLogger.info('Setting logger level to '+level)
  clientLogger.info('Setting logger level to '+level)

  clientLogger.level = level
  serverLogger.level = level
}
