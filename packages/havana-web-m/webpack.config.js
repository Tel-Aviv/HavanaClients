var path = require('path');
//const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//const WebpackCopyAfterBuildPlugin = require('webpack-copy-after-build-plugin');

module.exports = {
    entry: { 
        mobile: ["@babel/polyfill", path.resolve(__dirname, './src/index.js')]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },  
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: ['file-loader']
            } ]
    },   
    resolve: {
        extensions: ['*', '.js', '.jsx'],
        alias: {
            'react-native$': 'react-native-web'
        }
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].bundle.js',
        publicPath: '/',
        chunkFilename: '[name].bundle.js'

    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true
    },
    devtool: 'eval-source-map',     
}