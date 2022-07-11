const {defineConfig} = require('@vue/cli-service')
const port = process.env.port || process.env.npm_config_port || 8080 // dev port
const webpack = require('webpack')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
module.exports = defineConfig({
  chainWebpack: (config) => {
    config.plugin("polyfills").use(NodePolyfillPlugin);
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ],
    // resolve: {
    //   fallback: {
    //     "fs": false
    //   },
    // },
  },
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    open: true,
    host: "localhost",
    https: false,
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        // target: "http://localhost:3001",
        target: "http://192.168.50.79:3001",
        changeOrigin: true,
        ws: false,
        secure: false,
        pathRewrite: {
          ["^" + process.env.VUE_APP_BASE_API]: ""
        }
      }
    },
    // before: require('./mock/mock-server.js')
  }
})
