var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require('path');
//var cssExtract = new ExtractTextPlugin("../css/[name].css");
var c = require("../config.js");
module.exports = {
    // entry: {
    //     su: ""
    // },
    output: {
        path: c.files.dist("/libs/su/js"),
        publicPath: "",//TODO 填写生产环境静态文件路径
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loaders: ExtractTextPlugin.extract("style", "css")
                // loaders: "style-loader!css-loader"
            },
            {
                test: /\.vue$/,
                loader: 'vue'
            }, {
                test: /\.js$/,
                exclude: /node_modules|vue\/src|vue-router\/|vue-loader\/\//,
                loader: 'babel'
            }, {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url',
                query: {
                    limit: 10000,
                    name: '../images/[name].[hash:7].[ext]'
                }
            }, {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url',
                query: {
                    limit: 10000,
                    name: '../fonts/[name].[hash:7].[ext]'
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('../css/[name].css'),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                drop_console: false,
                warnings: false
            }
        })
    ],
    vue: {
        loaders: {
            css: ExtractTextPlugin.extract("css")
        }
    }
}