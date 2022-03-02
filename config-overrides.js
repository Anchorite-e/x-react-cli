const outputDir = 'dist'; // 打包路径

const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');

const paths = require('react-scripts/config/paths');
paths.appBuild = path.join(path.dirname(paths.appBuild), `./${outputDir}`);

const {
  override,
  addWebpackPlugin,
  addWebpackAlias
} = require('customize-cra');

const addCustomize = () => config => {
  config.devtool = false; // 关闭sourceMap
  config.output.path = path.resolve(__dirname, `./${outputDir}`); // 配置打包后的文件位置
  config.output.publicPath = './'; // 资源引用路径
  
  return config;
}

const splitChunks = () => config => {
  config.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // 不将注释提取到单独文件
      })
    ],
    splitChunks: {
      chunks: 'initial',
      cacheGroups: {
        react: { // 抽离node_modules下的库为一个chunk
          name: 'chunk-react',
          test: /[\\/]node_modules[\\/]react[\s\S]*/,
          priority: -1,
        },
        vendors: { // 抽离node_modules下的库为一个chunk
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          enforce: true,
        },
        common: { // 抽离所有入口的公用资源为一个chunk
          name: 'chunk-common',
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5,
          minSize: 0,
          priority: -20,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    }
  }
  
  return config;
}

module.exports = override(
  addWebpackAlias({
    '@': path.resolve(__dirname, './src')
  }),
  addWebpackPlugin(new ProgressBarPlugin()),
  process.env.NODE_ENV === 'production' && addWebpackPlugin(
    new UglifyJsPlugin({
      cache: false, // 开启打包缓存
      parallel: true, // 开启多线程打包
      uglifyOptions: {
        warnings: false, // 删除警告
        compress: {
          drop_console: true, // 移除 console
          drop_debugger: true // 移除 debugger
        }
      }
    })
  ),
  process.env.NODE_ENV === 'production' && addCustomize(),
  process.env.NODE_ENV === 'production' && splitChunks(),
  process.env.ANALYZER && addWebpackPlugin(new BundleAnalyzerPlugin()),
);
