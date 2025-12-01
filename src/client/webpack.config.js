const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const DumpBuildTimestampPlugin = require('./scripts/plugins/DumpBuildTimestampPlugin');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isWatch = process.argv.includes('--watch');
  const isDevServer = process.argv.includes('serve');
  
  // For dev server, use in-memory filesystem, for build use web/dist
  const outputPath = isDevServer 
    ? path.resolve(__dirname, 'dist')
    : path.resolve(__dirname, '../../web/dist');

  return {
    entry: './src/index.tsx',
    output: {
      path: outputPath,
      filename: isDevServer ? 'js/[name].js' : 'js/[name].[contenthash].js',
      chunkFilename: isDevServer ? 'js/[name].chunk.js' : 'js/[name].[contenthash].chunk.js',
      publicPath: isDevServer ? '/' : '.',
      clean: !isDevServer, // Don't clean on dev server
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@ohrm/core': path.resolve(__dirname, 'src/core'),
        '@ohrm/components': path.resolve(__dirname, 'src/core/components'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
            },
          },
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                additionalData: `@import "@/core/styles";`,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]',
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: 'body',
        minify: isProduction,
      }),
      new webpack.DefinePlugin({
        'process.env': {
          REACT_APP_API_BASE_URL: JSON.stringify(process.env.REACT_APP_API_BASE_URL || 'http://localhost/arithwise/web'),
          REACT_APP_API_VERSION: JSON.stringify(process.env.REACT_APP_API_VERSION || 'v1'),
          REACT_APP_NAME: JSON.stringify(process.env.REACT_APP_NAME || 'Arithwise HRM'),
          REACT_APP_VERSION: JSON.stringify(process.env.REACT_APP_VERSION || '5.0.0'),
          REACT_APP_ENV: JSON.stringify(process.env.REACT_APP_ENV || 'development'),
          REACT_APP_ENABLE_I18N: JSON.stringify(process.env.REACT_APP_ENABLE_I18N || 'true'),
          REACT_APP_ENABLE_DEBUG: JSON.stringify(process.env.REACT_APP_ENABLE_DEBUG || 'true'),
        },
      }),
      // Only use DumpBuildTimestampPlugin in production/watch mode, not dev server
      ...(isDevServer ? [] : [new DumpBuildTimestampPlugin()]),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
      client: {
        overlay: {
          errors: true,
          warnings: true,
        },
        logging: 'info',
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  };
};

