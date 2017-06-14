const {
  createConfig, defineConstants, env, addPlugins,
  entryPoint, setOutput, sourceMaps, webpack,
  customConfig,
} = require('@webpack-blocks/webpack2')
const typescript = require('@webpack-blocks/typescript')
const devServer = require('@webpack-blocks/dev-server2')
const Clean = require('clean-webpack-plugin')
const cssModules = require('./tools/webpack-blocks/css-loader')
const path = require('path')

const IS_DEV = process.env.NODE_ENV === 'development'

const DIST = `${__dirname}/static/dist`

module.exports = createConfig([
  entryPoint({
    bundle: [
      // IS_DEV && 'babel-polyfill',
      IS_DEV && 'react-hot-loader/patch',
      './src/main.tsx',
    ].filter(Boolean),
  }),
  setOutput({
    filename: '[name].js',
    path: DIST,
    publicPath: '/static/dist',
  }),
  cssModules(),
  typescript(),
  defineConstants({
    'process.env.NODE_ENV': process.env.NODE_ENV,
  }),
  customConfig({
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      // baseUrl in tsconfig.json is a runtime resolver, so webpack need add resolver.modules too.
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
  }),
  addPlugins([
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(`${DIST}/vendor-manifest.json`),
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'vendor',
    //     minChunks: function (module) {
    //        // this assumes your vendor imports exist in the node_modules directory
    //        return module.context && (
    //          module.context.indexOf('node_modules') !== -1 ||
    //          module.context.indexOf('src/vendor.js') !== -1)
    //     },
    // }),
    // //CommonChunksPlugin will now extract all the common modules from vendor and main bundles
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'manifest', //But since there are no more common modules between them we end up with just the runtime code included in the manifest file
    // }),
  ]),
  env('development', [
    devServer({
      hot: true,
      stats: {
        assets: false,
        colors: true,
        chunks: false,
        children: false,
      },
    }),
    devServer.proxy({
      '/api': { target: 'http://localhost:3000' },
    }),
    addPlugins([
      new webpack.NamedModulesPlugin(),
      // prints more readable module names in the browser console on HMR updates
    ]),
    sourceMaps(),
  ]),
  env('production', [
    addPlugins([
      new Clean(['dist'], {exclude: ['vendor.dll.js', 'vendor-manifest.json']}),
      new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        output: {
          comments: false,
        },
      }),
    ]),
    sourceMaps(),
  ]),
])
