const pathLib = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const config = require('./config');

const ROOT_PATH = pathLib.resolve(__dirname);
const ENTRY_PATH = pathLib.resolve(ROOT_PATH, 'app');
const OUTPUT_PATH = pathLib.resolve(`${ROOT_PATH}/server/api/`, 'build');

module.exports = {
    entry: {
        index: [
            'babel-polyfill',
            pathLib.resolve(ENTRY_PATH, 'index.js')
        ],
        vendor: ['react', 'react-dom', 'react-router-dom']
    },
    output: {
        path: OUTPUT_PATH,
        publicPath: '/',
        filename: '[name]-[hash:8].js'
    },
    devServer: { historyApiFallback: true },
    mode: 'development',//
    devtool: 'source-map',//
    node: {
        fs: "empty"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'env', 'stage-0']
                }
            },
            {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader'},
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},
            {test: /\.(jpe?g|png|gif)$/i, loader: 'file-loader?name=[name].[ext]'},
            {test: /\.ico$/, loader: 'file-loader?name=[name].[ext]'},
            {test: /\.(css|scss)$/, loaders: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap']}
            ]
    },
    plugins: [
        new CleanPlugin([`${ROOT_PATH}/server/api/build`]),
        new ProgressBarPlugin(),
        //new webpack.optimize.AggressiveMergingPlugin(),//
        //new webpack.HotModuleReplacementPlugin(),//
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
            "process.env.PORT": JSON.stringify(process.env.PORT),
            "process.env.HOST": JSON.stringify(process.env.HOST),
        }),
        new HtmlWebpackPlugin({
            title: "E4ZY.BET",
            showErrors: false,
        }),
        new ExtractTextPlugin({
            filename: '[name].css'
        }),
        new ExtractTextPlugin({
            filename: '[name].scss'
        }),
        //new webpack.NoEmitOnErrorsPlugin(),//
        //new webpack.HashedModuleIdsPlugin(),//
    ],
    resolve: {
        extensions: ['.js', '.json', '.sass', '.scss', '.css', 'jsx']
    }
};
