const path = require('path');
const buildPath = path.resolve(__dirname, 'dist');

const merge = require('webpack-merge');

// clean dist, before build, otherwise, dist will contain
// old build files.
const CleanWebpackPlugin = require('clean-webpack-plugin');
const cleanWebpackPlugin = new CleanWebpackPlugin(['dist']);

// create html based on the bundled js name
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: './srcStatic/index.html',
    filename: 'index.html',
    hash: true,
});

// advanced favicon options
// https://github.com/jantimon/html-webpack-plugin/issues/129#issuecomment-214147697
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const faviconsWebpackPlugin = new FaviconsWebpackPlugin({
    // Your source logo
    logo: './srcStatic/favicon.ico',
    // The prefix for all image files (might be a folder or a name)
    prefix: 'favicon.[hash:8]/',
    // Emit all stats of the generated icons
    emitStats: false,
    // The name of the json containing all favicon information
    statsFilename: 'iconstats-[hash].json',
    // Generate a cache file with control hashes and
    // Don't rebuild the favicons until those hashes change.
    // Doesn't work. Always rebuild.
    // https://github.com/jantimon/favicons-webpack-plugin/issues/26
    persistentCache: true,
    // Inject the html into the html-webpack-plugin
    inject: true,
    icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        favicons: true,
        firefox: false,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false,
    }
});

// Use path instead of hash id. Benefit both development and production.
// https://github.com/webpack/webpack.js.org/issues/652#issuecomment-273023082
const webpack = require('webpack');
const namedModulesPlugin = new webpack.NamedModulesPlugin();

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const uglifyJsPlugin = new UglifyJsPlugin();

const config = {};

config.common = {
    entry: {
        main: './srcMain/main.js',
        sw: './srcSw/sw.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/react',
                        ],
                        plugins: [
                            [
                                '@babel/plugin-proposal-class-properties',
                                {loose: true},
                            ],
                            '@babel/plugin-proposal-object-rest-spread',
                        ],
                    },
                },
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ],
    },
    plugins: [
        cleanWebpackPlugin,
        htmlWebpackPlugin,
        faviconsWebpackPlugin,
        namedModulesPlugin,
    ],
};

config.dev = {
    // Don't use hash in development environment
    // https://webpack.js.org/guides/build-performance
    output: {
        filename: '[name].js',
        path: buildPath,
        globalObject: 'this',
    },
    // [In most cases, cheap-module-eval-source-map is the best option]
    // (https://webpack.js.org/guides/build-performance)
    devtool: 'cheap-module-eval-source-map',
    mode: 'development',
};

config.prod = {
    // hash: corresponding to build.
    // chunkhash: corresponding to entrypoints. js+css+wasm
    // contenthash(recommended): corresponding to assets.
    // https://github.com/webpack/webpack.js.org/issues/2096
    output: {
        filename: '[name].[contenthash].js',
        path: buildPath,
        globalObject: 'this',
    },
    optimization: {
        minimize: true,
        minimizer: [uglifyJsPlugin],
        usedExports: true,
        sideEffects: true,
    },
    mode: 'production',
};

module.exports = (env) => {
    // merge two config object
    return merge(config.common, config[env]);
};
