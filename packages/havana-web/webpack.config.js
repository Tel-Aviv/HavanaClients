const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv').config({
    path: path.join(__dirname, '.env')
});

const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {

    plugins: [
        new FileManagerPlugin({
            onEnd: {
                copy: [
                    { 
                        source: './dist/', 
                        destination: process.env.publish_destination
                    }
                ]
            }
            }),
            new webpack.ProgressPlugin({
                activeModules: true,
                entries: true,
                profile: true,
            }),
            new webpack.DefinePlugin({
                "process.env.mock": process.env.mock
            })
    ],
    entry: {
        bundle: ["@babel/polyfill", path.resolve(__dirname, './src/index.js')]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },            
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', 'less'],
        alias: {
            "@components": path.resolve(__dirname, "src/components"),
            "@reports": path.resolve(__dirname, 'src/components/reports')
        }   
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        chunkFilename: '[name].bundle.js'
        // filename: 'bundle.js'
    },   
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        disableHostCheck: true
    },
    devtool: 'source-map'
}