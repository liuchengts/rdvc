const {defineConfig} = require('@vue/cli-service')
const port = process.env.port || process.env.npm_config_port || 8080 // dev port
const webpack = require('webpack')

module.exports = defineConfig({
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
        target: "http://localhost:8089",
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
