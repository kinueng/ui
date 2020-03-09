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
	log4js = require('log4js'),
	logger = log4js.getLogger('server')

module.exports = function(app) {
  var router = express.Router();

  router.post('/log', logMessage)
  
  //Extend the REST apis
  router = extensions.addRoutes(router)

  app.use('/extensions', express.json(), router)
}

function logMessage(req, res) {
  const message = req.body.message
  const type = req.body.type

  if(type === 'error') {
    logger.error(message)
  } else if(type === 'warn') {
    logger.warn(message)
  } else if(type === 'info') {
    logger.info(message)
  } else if(type === 'debug') {
    logger.debug(message)
  } else {
    logger.trace(message)
  }

  res.status(200).send({ success: true })
  res.end
}
