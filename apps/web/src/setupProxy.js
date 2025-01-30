const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  console.log('Proxy middleware loaded!')

  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://0.0.0.0:9002',
      changeOrigin: true,
      logLevel: 'debug',
    }),
  )
}
