const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  console.log('Proxy middleware loaded!')

  app.use(
    '/api',
    createProxyMiddleware({
      target: `${window.location.protocol}://${window.location.hostname}:9002`,
      changeOrigin: true,
      logLevel: 'debug',
    }),
  )
}
