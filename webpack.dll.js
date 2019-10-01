/*****************************************************************
 *
 * Copyright 2019 IBM Corporation
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

var path = require('path'),
    webpack = require('webpack'),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin'),
    AssetsPlugin = require('assets-webpack-plugin'),
    WebpackMd5Hash = require('webpack-md5-hash'),
    CompressionPlugin = require('compression-webpack-plugin')

var NO_OP = () => { },
    PRODUCTION = process.env.BUILD_ENV ? /production/.test(process.env.BUILD_ENV) : false

process.env.BABEL_ENV = 'client'

module.exports = {
  entry: {
    'vendorappnav': [
      'babel-polyfill',
      'carbon-components-react',
      'loadable-components',
      'lodash',
      'moment',
      'node-libs-browser',
      'normalizr',
      'prop-types',
      'react-ace',
      'react-dom',
      'react-dom/server',
      'react-router-dom',
      'react',
      'redux-logger',
      'redux-thunk',
      'react-transition-group',
      'reselect'
    ]
  },
  output: {
    path: __dirname + '/public',
    filename: PRODUCTION ? 'dll.[name].[chunkhash].js' : 'dll.[name].js',
    library: '[name]'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(PRODUCTION ? 'production' : 'development')
      }
    }),
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dll', '[name]-manifest.json'),
      name: '[name]',
      context: __dirname
    }),
    PRODUCTION ? new UglifyJSPlugin({
      sourceMap: true
    }) : NO_OP,
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
    }),
    new AssetsPlugin({
      path: path.join(__dirname, 'public'),
      fullPath: false,
      prettyPrint: true,
      update: true
    }),
    PRODUCTION ? new webpack.HashedModuleIdsPlugin() : new webpack.NamedModulesPlugin(),
    new WebpackMd5Hash()
  ],
  resolve: {
    modules: [path.join(__dirname, 'node_modules')]
  }
}
