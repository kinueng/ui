const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const config = require('./webpack.config.js');
const i18n = require('node-i18n-util');

const app = express();

const compiler = webpack(config);

// TODO: Bring in as much of the original app.js into this file

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
// FIXME: How to remove this from production?
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

// Serve the files on port 3000.
app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.locals.manifest = require('./public/webpack-assets.json');

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Strict-Transport-Security', 'max-age=99999999');
  res.render('index', {
    title: 'Application Navigator',
    myLocale: i18n.locale(req),
  });
});
