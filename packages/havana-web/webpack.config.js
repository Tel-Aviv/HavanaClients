const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv').config({
    path: path.join(__dirname, '.env')
});

const FileManagerPlugin = require('filemanager-webpack-plugin');
// const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

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
            }),
        // new AntdDayjsWebpackPlugin()    
    ],
    entry: {
        bundle: ["@babel/polyfill", path.resolve(__dirname, './src/index.js')]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src'),
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },            
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.less'],
        alias: {
            "@components": path.resolve(__dirname, "src/components"),
            "@reports": path.resolve(__dirname, 'src/components/reports')
        }   
    },
    output: {
        path: __dirname + '/dist',
        publicPath: process.env.public_path,
        chunkFilename: '[name].bundle.js',
        pathinfo: false
    },   
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        disableHostCheck: true
    },
    devtool: 'source-map',
    // optimization: {
    //     runtimeChunk: true
    // }
}