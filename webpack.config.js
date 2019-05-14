const path = require('path');
const buildPath = path.resolve(__dirname, 'dist');
const srcAppPath = path.resolve(__dirname, 'srcApp');
const srcImagePath = path.resolve(__dirname, 'srcImage');
// 1st option for service worker
// const srcSwPath = path.resolve(__dirname, 'srcSw');
const swPath = path.resolve(__dirname, 'srcSw/sw.js');

const merge = require('webpack-merge');

// create html based on the bundled js name
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: './srcTemplate/index.html',
    // inject the script in body tag
    inject: 'body',
});

// Use path instead of hash id. Benefit both development and production.
// https://github.com/webpack/webpack.js.org/issues/652#issuecomment-273023082
const webpack = require('webpack');
const namedModulesPlugin = new webpack.NamedModulesPlugin();

// two options for service worker:
// 1. Set an entry for sw.js. I already put the demonstration in this file.
//    This works for build, but doesn't work for webpack-dev-server.
//    Because dev server put the whole file in `eval`, and will not run in my chrome for some
//    reason. So all listener defined in it will not take effect.
//    But this way make your sw.js through the webpack process, which means will be transpiled.
// 2. Use ServiceWorkerWebpackPlugin. sw.js will not be transpiled, but will work in development
//    mode. And you could use serviceWorkerOption for cache.
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const serviceWorkerWebpackPlugin = new ServiceWorkerWebpackPlugin({
    entry: swPath,
});

const config = {};
config.common = {
    entry: {
        main: './srcApp/main.js',
        // 1st option for service worker
        // sw: './srcSw/sw.js',
    },
    module: {
        rules: [
            {
                include: [
                    srcAppPath,
                    // 1st option for service worker
                    // srcSwPath
                ],
                test: /\.js$/,
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
                include: [
                    srcImagePath,
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            // outputPath have to be relative path,
                            // absolute path won't work in dev server.
                            outputPath: './image',
                            name: '[folder]/[name].[hash:20].[ext]',
                        },
                    }
                ]
            },
        ],
    },
    plugins: [
        htmlWebpackPlugin,
        serviceWorkerWebpackPlugin,
        namedModulesPlugin,
    ],
    optimization: {
        // SplitChunksPlugin, separate vendor chunks
        splitChunks: {
            cacheGroups: {
                // only separate chunks from node_modules
                default: false,
                vendors: false,
                lib: {
                    // sync + async chunks
                    chunks: 'all',
                    // node_modules path
                    test: /node_modules/,
                    name: 'lib',
                },
            }

        }
    }
};
config.dev = {
    // https://webpack.js.org/configuration/mode/#mode-development
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    // Don't use hash in development environment
    // https://webpack.js.org/guides/build-performance
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: buildPath,
        globalObject: 'this',
    },
    // [In most cases, cheap-module-eval-source-map is the best option]
    // (https://webpack.js.org/guides/build-performance)
};
config.prod = {
    mode: 'production',
    // hash: corresponding to build.
    // chunkhash: corresponding to entrypoints. js+css+wasm
    // contenthash(recommended): corresponding to assets.
    // https://github.com/webpack/webpack.js.org/issues/2096
    output: {
        // sw.js don't need hash
        // filename: '[name].[contenthash].js',
        filename: (chunkData) => {
            return chunkData.chunk.name === 'sw'
                ? '[name].js'
                : '[name].[contenthash].js';
        },
        chunkFilename: '[name].[contenthash].js',
        path: buildPath,
        // default globalObject is window, which is wrong for sw
        globalObject: 'this',
    },
};

module.exports = (env) => {
    // merge two config object
    return merge(config.common, config[env]);
};
