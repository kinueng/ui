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
const FileManagerPlugin = require('filemanager-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const VersionFile = require('webpack-version-file');
const CompressionPlugin = require('compression-webpack-plugin');
const config = require('./config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const NO_OP = () => { };
const PRODUCTION = process.env.BUILD_ENV ? /production/.test(process.env.BUILD_ENV) : false;

process.env.BABEL_ENV = 'client';

const prodExternals = {};

module.exports = {
  mode: 'development',
  context: __dirname,
  devtool: PRODUCTION ? 'source-map' : 'cheap-module-source-map',
  stats: { children: false },
  entry: {
    common: './src-web-v2/common.scss',
    header: './src-web-v2/index.header.js',
  },

  externals: Object.assign(PRODUCTION ? prodExternals : {}, {
    // replace require-server with empty function on client
    './require-server': 'var function(){}',
  }),

  module: {
    rules: [
      {
        // Transpile React JSX to ES5
        test: [/\.jsx$/, /\.js$/],
        exclude: /node_modules|\.scss/,
        loader: 'babel-loader?cacheDirectory',
      },
      {
        test: [/\.scss$/],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader?sourceMap',
          },
          {
            loader: 'postcss-loader?sourceMap',
            options: {
              plugins() {
                return [
                  require('autoprefixer'),
                ];
              },
            },
          },
          {
            loader: 'sass-loader?sourceMap',
            options: {
              prependData: `$font-path: "${config.get('contextPath')}/fonts";`,
            },
          },
        ],
      },
      {
        test: /\.woff2?$/,
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
      {
        test: /\.properties$/,
        loader: 'properties-loader',
      },
      {
        test: /\.handlebars$/,
        loader: 'handlebars-loader',
        query: {
          partialDirs: [
            path.resolve(__dirname, './templates/partials'),
          ],
          helperDirs: [
            path.resolve(__dirname, './templates/helpers'),
          ],
          precompileOptions: {
            knownHelpersOnly: false,
          },
        },
      },
      {
        test: /\.svg$/,
        use: [
          'svg-sprite-loader',
        ],
      },
      {
        test: /\.(png|jpg)$/,
        use: [
          'svg-sprite-loader?symbolId=icon-[name]',
          'image2svg-loader',
        ],
      },
    ],
    noParse: [
      // don't parse minified bundles (vendor libs) for faster builds
      /\.min\.js$/,
    ],
  },

  output: {
    filename: PRODUCTION ? 'js/[name].[hash].min.js' : 'js/[name].min.js', // needs to be hash for production (vs chunckhash) in order to cache bust references to chunks
    chunkFilename: PRODUCTION ? 'js/[name].[chunkhash].min.js' : 'js/[name].min.js',
    path: `${__dirname}/public`,
    publicPath: config.get('contextPath').replace(/\/?$/, '/'),
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
      CONSOLE_CONTEXT_URL: JSON.stringify(config.get('contextPath')),
    }),
    new webpack.DllReferencePlugin({
      context: process.env.STORYBOOK ? path.join(__dirname, '..') : __dirname,
      manifest: require('./dll/vendorappnav-manifest.json'),
    }),
    new MiniCssExtractPlugin({
      filename: PRODUCTION ? 'css/[name].[contenthash].css' : 'css/[name].css',
      chunkFilename: PRODUCTION ? 'css/[id].[contenthash].css' : 'css/[id].css',
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        eslint: {
          configFile: './.eslintrc.json',
          quiet: true,
        },
      },
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: __dirname,
      },
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.js$|\.css$/,
      minRatio: 1,
    }),
    new AssetsPlugin({
      path: path.join(__dirname, 'public'),
      fullPath: false,
      prettyPrint: true,
      update: true,
    }),
    PRODUCTION ? new webpack.HashedModuleIdsPlugin() : new webpack.NamedModulesPlugin(),
    new WebpackMd5Hash(),
    new FileManagerPlugin({
      onEnd: {
        copy: [
          { source: 'node_modules/carbon-icons/dist/carbon-icons.svg', destination: 'public/graphics' },
          { source: 'graphics/*.svg', destination: 'public/graphics' },
          { source: 'graphics/*.png', destination: 'public/graphics' },
          { source: 'fonts', destination: 'public/fonts' },
        ],
      },
    }),
    new VersionFile({
      output: './public/version.txt',
      package: './package.json',
      template: './version.ejs',
      data: {
        date: new Date(),
        revision: (new GitRevisionPlugin()).commithash(),
      },
    }),
  ],

  resolveLoader: {
    modules: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, 'node_modules/node-i18n-util/lib'), // properties-loader
    ],
  },
};
