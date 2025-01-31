const { join } = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: join(__dirname, 'src/main.tsx'),
  output: {
    path: join(__dirname, '../../dist/apps/web'),
    filename: 'main.js',
    publicPath: '/',
  },
  mode: 'development',
  devServer: {
    port: 9001,
    allowedHosts: 'all',
    historyApiFallback: true,
    proxy: [
      {
        '/api': {
          target: 'http://localhost:9002',
          changeOrigin: true,
          secure: false,
        },
      },
      {
        '/ws': {
          target: 'ws://localhost:9003',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: join(__dirname, 'public/index.html'),
    }),
  ],
}
