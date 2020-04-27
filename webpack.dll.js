/** ***************************************************************
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
 **************************************************************** */

const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const CompressionPlugin = require('compression-webpack-plugin');

const NO_OP = () => { };
const PRODUCTION = process.env.BUILD_ENV ? /production/.test(process.env.BUILD_ENV) : false;

process.env.BABEL_ENV = 'client';

module.exports = {
  entry: {
    vendorappnav: [
      'carbon-components-react',
      'lodash',
      'node-libs-browser',
      'prop-types',
      'react-dom',
      'react-dom/server',
      'react',
      '@carbon/icons',
      '@carbon/themes',
    ],
  },
  output: {
    path: `${__dirname}/public`,
    filename: PRODUCTION ? 'dll.[name].[chunkhash].js' : 'dll.[name].js',
    library: '[name]',
  },

  optimization: {
    minimize: PRODUCTION,
    minimizer: [new TerserPlugin()],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(PRODUCTION ? 'production' : 'development'),
      },
    }),
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dll', '[name]-manifest.json'),
      name: '[name]',
      context: __dirname,
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
    }),
    new AssetsPlugin({
      path: path.join(__dirname, 'public'),
      fullPath: false,
      prettyPrint: true,
      update: true,
    }),
    PRODUCTION ? new webpack.HashedModuleIdsPlugin() : new webpack.NamedModulesPlugin(),
    new WebpackMd5Hash(),
  ],
  resolve: {
    modules: [path.join(__dirname, 'node_modules')],
  },
};
