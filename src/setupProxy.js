const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://tdms.cat-tools.com',
      changeOrigin: true,
      secure: false,
      cookieDomainRewrite: 'localhost',
      onProxyRes: function(proxyRes, req, res) {
        // Изменяем CORS заголовки
        proxyRes.headers['Access-Control-Allow-Origin'] = 'https://gilded-chebakia-8cb622.netlify.app';
        proxyRes.headers['Access-Control-Allow-Credentials'] = true;
        
        // Логирование для отладки
        console.log('Proxy response:', {
          path: req.path,
          status: proxyRes.statusCode,
          headers: proxyRes.headers
        });
      }
    })
  );
}; 