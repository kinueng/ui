/*****************************************************************
 *
 * Copyright 2019 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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

const express = require('express'),
      config = require('./config/config-defaults.json'),
      path = require('path'),
      fs = require('fs'),
      moment = require('moment'),
      i18n = require('node-i18n-util'),
      app = express(),
      axios = require('axios')

var log4js = require('log4js'),
    consolidate = require('consolidate'),
    cookieParser = require('cookie-parser'),
    csurf = require('csurf'),
    https = require('https')

const { createProxyMiddleware } = require('http-proxy-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');

const logger = log4js.getLogger('server')
var log4js_config = process.env.LOG4JS_CONFIG ? JSON.parse(process.env.LOG4JS_CONFIG) : undefined
log4js.configure(log4js_config || 'config/log4js.json')

// require('./lib/shared/dust-helpers')
require('./server/routers/index')(app)

const TARGET = process.env.TARGET || 'http://localhost:9080',
      CONTEXT_PATH = config.contextPath,
      STATIC_PATH = path.join(__dirname, 'public'),
      KUBE_ENV = process.env.KUBE_ENV || 'okd',
      APPNAV_CONFIGMAP_NAMESPACE = process.env.KAPPNAV_CONFIG_NAMESPACE || 'kappnav'

const csrfMiddleware = csurf({ cookie: true })

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
// FIXME: How to remove this from production?

const webpackConfig = require('./webpack.config.js');
app.use(webpackDevMiddleware(webpack(webpackConfig), {
  publicPath: webpackConfig.output.publicPath,
}));

var exclude = function(path) {
  return function(req, res, next) {
    if (path !== req.path) {
      return next()
    }
  }
}

//Redirect / to /kappnav-ui, (because the auth proxy sidecar redirects to /)
app.all('/', (req, res, next) => {
  res.redirect(CONTEXT_PATH)
})

app.use(exclude('/health'), cookieParser(), csrfMiddleware)

// error handler
app.use((err, req, res, next) => {
  logger.debug('err.code is ' + err.code)
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  res.status(403)
  logger.debug('Error with CSRF token')
  res.send('form tampered with')
})

app.all('*', (req, res, next) => {
    req.user = req.headers['x-forwarded-user']
    if(!req.user || req.user === ''){
      req.user = KUBE_ENV
    }
    logger.debug('req.user is ' + req.user)
    const cookieConfig = {
      httpOnly: true, // to disable accessing cookie via client side js
      secure: true, // to force https (if you use it)
      maxAge: 1000000000 // ttl in ms (remove this option and cookie will die when browser is closed)
    };
    res.cookie('kappnav-user', req.user, cookieConfig);
    next()
})

app.use(CONTEXT_PATH, express.static(STATIC_PATH, {
  maxAge: process.env.NODE_ENV === 'development' ? 0 : 1000 * 60 * 60 * 24 * 365,
  setHeaders: (res, fp) => {
    if (fp.startsWith(`${STATIC_PATH}/nls`)) {
      res.setHeader('Cache-Control', 'max-age=0')
    } else {
      res.setHeader('Expires', moment().add(12, 'months').toDate())
    }
    res.setHeader('Strict-Transport-Security', 'max-age=99999999')
    // eslint-disable-next-line quotes
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'self'")
  }
}))

app.use('/kappnav', createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  secure: false
}))

/* Commenting this out because directing to /oauth/sign_in does not work in ocp 4.3, TODO: find a new logout solution
app.use('/kappnav-ui/logout', (req, res) => {
  //For oauth proxy environemnts remove user and redirect to sign_in.  That doubles as a logout path and removes the session cookie.
  if(KUBE_ENV === 'okd' || KUBE_ENV === 'ocp') {
    res.clearCookie('kappnav-user')
    var host = 'https://'+req.headers['host']
    res.redirect(host + '/oauth/sign_in')
  }
})*/

const agent = new https.Agent({  
  rejectUnauthorized: false
});

app.use('/kappnav-ui/openshift/appNavIcon.css', (req, res) => {
  axios({
    url: TARGET + '/kappnav/configmap/kappnav-config?namespace=' + APPNAV_CONFIGMAP_NAMESPACE,
    method: 'GET',
    httpsAgent: agent
  }).then(function (response) {
    if (response.status === 200) {
      var url = response.data['kappnav-url']
      logger.debug('Successfully got appNavIcon.css')
      const appNavIcon =
          `
            .icon-appnav {
              background-repeat: no-repeat;
              background-image: url(${url}/graphics/KAppNavlogo.svg);
              height: 20px;
            }
 
           .icon-kappnav-feature {
              display: block;
              background-repeat: no-repeat;
              background-image: url(${url}/graphics/KAppNavlogo.svg);
              height: 72px;
              width: 72px;
            }
          `
      res.type('.css')
      res.send(appNavIcon)
    } else {
      res.status(500).send("Failed to get appNavIcon.css")
    }
  }).catch(function (error) {
    res.status(500).send(error.message)
  })
})

app.use('/kappnav-ui/openshift/featuredApp.js', (req, res) => {
  axios({
    url: TARGET + '/kappnav/configmap/kappnav-config?namespace='+APPNAV_CONFIGMAP_NAMESPACE,
    method: 'GET',
    httpsAgent: agent
  }).then(function (response) {
    if (response.status === 200) {
      var url = response.data['kappnav-url']
      logger.debug('Successfully got featuredApp.css')
      const featuredApp =
          `
            (function() {
              window.OPENSHIFT_CONSTANTS.SAAS_OFFERINGS = [{
                  title: "kAppNav",                           // The text label
                  icon: "icon-kappnav-feature",               // The icon you want to appear
                  url: "${url}",      //  Where to go when this item is clicked
                  description: "Kubernetes Application Navigator"      // Short description
                }]
            }())
          `
      res.type('.js')
      res.send(featuredApp)
    } else {
      res.status(500).send("Failed to get featuredApp.css")
    }
  }).catch(function (error) {
    res.status(500).send(error.message)
  })
})


app.use('/kappnav-ui/openshift/appLauncher.js', (req, res) => {
  axios({
    url: TARGET + '/kappnav/configmap/kappnav-config?namespace='+APPNAV_CONFIGMAP_NAMESPACE,
    method: 'GET',
    httpsAgent: agent
  }).then(function (response) {
    if (response.status === 200) {
      var url = response.data['kappnav-url']
      logger.debug('Successfully got appLauncher.css')
      const appLauncher =
          `
          (function() {
            window.OPENSHIFT_CONSTANTS.APP_LAUNCHER_NAVIGATION = [{
              title: "kAppNav",                            // The text label
              iconClass: "icon-appnav",                    // The icon you want to appearl
              href: "${url}",        // Where to go when this item is clicked
              tooltip: "Kubernetes Application Navigator"             // Optional tooltip to display on hover
            }]
          }())
          `
      res.type('.js')
      res.send(appLauncher)
    } else {
      res.status(500).send("Failed to get appLauncher.css")
    }
  }).catch(function (error) {
    res.status(500).send(error.message)
  })
})

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.locals.manifest = require('./public/webpack-assets.json')

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Strict-Transport-Security', 'max-age=99999999')
  // eslint-disable-next-line quotes
  // res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' blob: https://"+req.headers['host']+"/*; frame-ancestors 'self'")
  logger.debug('APPNAV_CONFIGMAP_NAMESPACE is : ' + APPNAV_CONFIGMAP_NAMESPACE + ' CONTEXT_PATH is : ' + CONTEXT_PATH)
  res.render('index', {
    myLocale: i18n.locale(req),
    kube: KUBE_ENV,
    appnavConfigmapNamespace: APPNAV_CONFIGMAP_NAMESPACE,
    contextPath: CONTEXT_PATH,
    title: 'Application Navigator',
    csrfToken: req.csrfToken(),
    displayUser : req.user
  })
})


const port = process.env.PORT || config.httpPort

var http = require('http')
var server = http.createServer(app)

server.listen(port, () => {
  logger.info(`application navigator listening on http://localhost:${port}${CONTEXT_PATH}`)
})
