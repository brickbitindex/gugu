var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var config = {
  context: path.join(__dirname, '..', '/'),
  entry: {
    // Add each page's entry here
    test: './testPage/index',
    gugu: './src/index',
  },
  output: {
    path: path.join(__dirname, '..', '/test/dist'),
    filename: '[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')), // judge if dev environment.
      __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false')) // judge if secret environment.
    }),
    new ExtractTextPlugin("[name].css"),
    new HtmlWebpackPlugin({
      template: './testPage/template.html',
      filename: 'test.html',
      chunks: ['test'],
      inject: 'head'
    }),
    new CopyWebpackPlugin([
      { from: './testPage/snippet', to: 'snippet' },
    ]),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel"
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css!postcss'
      },
      {
        test: /\.scss$/,
        loader: 'to-string!css!postcss!sass'
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loader: 'url?limit=10000!img?progressive=true'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg)$/,
        loader: 'url?limit=10000'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.html$/,
        loader: 'raw'
      },
    ],
    noParse: []
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx', '.reactx', 'react'],
    alias: {}
  },
  devServer: {
    host: '0.0.0.0',
    historyApiFallback: {
      rewrites: [
        { from: /\/test/, to: '/test.html' },
      ]
    },
    // proxy: {
    //   '/api/v1/*': {
    //     target: 'http://123.59.79.196',
    //     secure: false
    //   }
    // }
  },
  externals: {
    jquery: "$",
  }
};

module.exports = config;