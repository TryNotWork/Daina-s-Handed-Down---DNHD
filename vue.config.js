const { defineConfig } = require('@vue/cli-service')
const ElementPlusPlugin = require('unplugin-element-plus/webpack')

module.exports = defineConfig({
  publicPath: '/',
  transpileDependencies: true,
  productionSourceMap: false,

  configureWebpack: {
    plugins: [
      ElementPlusPlugin({})
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 30 * 1024,
        maxAsyncRequests: 30,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
            test: /[\\/]node_modules[\\/](vue|axios|element-plus)[\\/]/,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            minSize: 10 * 1024
          }
        }
      }
    }
  },

  chainWebpack: config => {
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|ico|svg|webp)(\?.*)?$/)
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        mozjpeg: { quality: 85, progressive: true },
        pngquant: { quality: [0.7, 0.9] },
        gifsicle: { enabled: false },
        optipng: { enabled: false },
        svgo: { enabled: true }
      })
      .end()
      .enforce('pre');

    const types = ['vue-modules', 'vue', 'normal-modules', 'normal'];

    types.forEach(type => {
      config.module
        .rule('css')
        .oneOf(type)
        .use('css-loader')
        .tap(options => ({
          ...options,
          url: {
            filter: (url) => !url.startsWith('/')
          }
        }));
    });
  }
})