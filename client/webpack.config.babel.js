"use strict"

require("dotenv").load({ path: process.env.ENV_PATH || ".env" })

let webpack = require("webpack")
let fs = require("fs")

let glob = require("glob")
let path = require("path")
let ExtractTextPlugin = require("extract-text-webpack-plugin")


let entries = {}
let root = path.resolve("./assets/javascripts")
let publicRoot = path.resolve("./public")

let config = {
  entry: "./assets/javascripts/index.js",

  output: {
    path: `${publicRoot}/js`,
    filename: "index.js",
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
          use: ["babel-loader"],

          include: root,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.styl$/,
        use: ["style-loader", "css-loader", "stylus-loader"],
      },
    ],
  },
  resolve: {
    modules: [root, publicRoot, "node_modules"],
    extensions: [".js", ".jsx"],
    enforceExtension: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: process.env.node_env === "production",
      ___TEST___: false,
    }),
  ],
}

if (process.env.NODE_ENV === "production") {
  config.module.rules.forEach(rule => {
    if (rule.use[0] === "style-loader") {
      let otherLoaders = rule.use.slice(1)
      rule.use = ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: otherLoaders,
      })
    }
  })

  config.plugins.push(
    new ExtractTextPlugin({ filename: "../css/[name].css", allChunks: true }))

  config.plugins.push(
    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }))

  config.devtool = "hidden-source-map"

  config.output.devtoolModuleFilenameTemplate = "[resource-path]"
  config.output.devtoolFallbackModuleFilenameTemplate = "[resource-path]?[hash]"

  // Needed for file-loader to hook up the asset paths correctly on production
  config.output.publicPath = "/js/"
}
else {
  config.devtool = "cheap-module-eval-source-map"
  config.output.pathinfo = true

  // Set up hot-reloading dev server.
  config.devServer = {
    inline: true,
    hot: true,
    host: "127.0.0.1",
    port: 8000
  }

  // // If our webpack base url doesn't explicitly specify http, then use https.
  // let webpackBaseUrl = process.env.TEST_WEBPACK_BASE_URL || process.env.BASE_URL
  // if (webpackBaseUrl.indexOf("http://") === -1) {
  //   Object.assign(
  //     config.devServer,
  //     {
  //       // Only allow external access when https is enabled.
  //       allowedHosts: [".clay.affinity.co"],
  //       // Allow hot-reloading
  //       headers: { "Access-Control-Allow-Origin": "*" },
  //       host: "0.0.0.0",
  //       https: {
  //         cert: fs.readFileSync(process.env.CLAY_CERT_PATH),
  //         key: fs.readFileSync(process.env.CLAY_KEY_PATH),
  //       },
  //     },
  //   )
  // }

  config.output.publicPath = "http://127.0.0.1:8000/js/"
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
  config.plugins.push(new webpack.NamedModulesPlugin())
  config.plugins.push(new webpack.EvalSourceMapDevToolPlugin())

  // Enable live refresh for react components while maintaining state.
  config.module.rules[0].use.unshift("react-hot-loader/webpack")
}

module.exports = config
