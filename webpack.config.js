const path = require('path');
const buildPath = path.resolve(__dirname, 'dist');
const srcAppPath = path.resolve(__dirname, 'srcApp');
const srcImagePath = path.resolve(__dirname, 'srcImage');

const merge = require('webpack-merge');

// create html based on the bundled js name
const HtmlPlugin = require('html-webpack-plugin');
const htmlPlugin = new HtmlPlugin({
    template: './srcTemplate/index.html',
    // inject the script in body tag
    inject: 'body',
    // true doesn't work, need a object if want to enable minify
    // https://github.com/kangax/html-minifier#options-quick-reference
    minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
    },
});

// Use name instead of chunk id. Benefit both development and production.
// https://github.com/webpack/webpack.js.org/issues/652#issuecomment-273023082
const webpack = require('webpack');
const namedModulesPlugin = new webpack.NamedModulesPlugin(
);

// gzip compress
const CompressionPlugin = require('compression-webpack-plugin');
const compressionPlugin = new CompressionPlugin({
    filename: '[path].gz[query]', // default '[path].gz[query]'
    // brotli available after Node 11.7
    // algorithm: 'brotliCompress',
    algorithm: 'gzip', // default 'gzip'
    compressionOptions: {level: 9}, // default 9
    threshold: 0, // default 0. Only compress asset bigger than this threshold
    minRatio: 0.8, // default 0.8. Only compress asset will achieve this ratio.
                   // 1 to compress all. 0.8 will filter images.
    deleteOriginalAssets: false, // default false
    // cache in node_modules/.cache/
    cache: true,
});

// two options for service worker, I already put the two demonstrations in this file.:
// 1. Set an entry for sw.js.
//    This works for build, but doesn't work for webpack-dev-server.
//    Because dev server put the whole file in an object and passes it to a function
//    function(){}({function(){eval("YourSwCode")},})
//    and will not run in my chrome maybe since serviceWorker has different environment than window.
//    So all listener defined in it will not take effect.
//    But this way make your sw.js through the webpack process, which means will be transpiled.
// 2. Use ServiceWorkerWebpackPlugin or NekR/offline-plugin(more stars).
//    sw.js will not be transpiled, but will work in development
//    mode. And you could use serviceWorkerOption for cache.

// 1st option for service worker
const srcSwPath = path.resolve(__dirname, 'srcSw');
// 2nd option for service worker
// const swPath = path.resolve(__dirname, 'srcSw/sw.js');
// const ServiceWorkerPlugin = require('serviceworker-webpack-plugin');
// const serviceWorkerPlugin = new ServiceWorkerPlugin({
//     entry: swPath,
// });

// enable HMR
const hmrPlugin = new webpack.HotModuleReplacementPlugin()

// my plugin
// https://github.com/kossnocorp/on-build-webpack/issues/5#issuecomment-432192978
const distSwPath = path.resolve(buildPath, 'sw.js');
const distPwaManifestPath = path.resolve(buildPath, 'pwa-manifest.json');
const fs = require('fs');
const myPlugin = {
    apply: (compiler) => {
        // https://github.com/webpack/webpack/blob/3b344f24741bf7e55277d7e62134ad4bb64ac945/lib/Stats.js
        // assets: [
        //     {
        //         "name": "image/icon/16x16.c92b85a5b907c70211f4.ico",
        //         "size": 3870,
        //         "chunks": [],
        //         "chunkNames": [],
        //         "emitted": true
        //     }, ...
        // ]
        compiler.hooks.done.tap('AfterEmitPlugin', (stats) => {
            // 1. insert webpackGeneratedAssets into sw.js for 1st option for service worker
            let oldString = fs.readFileSync(distSwPath); //read existing contents into data
            let fd = fs.openSync(distSwPath, 'w+');
            let newString = new Buffer(
                'webpackGeneratedAssets = ' +
                JSON.stringify(stats.toJson().assets
                    .map(i => i.name)
                    .filter(i => i !== 'sw.js') // remove sw.js
                    .filter(i => !/.*\.gz$/.test(i)) // remove gzip files
                ) + ';\n'
            );
            // write new string
            fs.writeSync(fd, newString, 0, newString.length, 0);
            // append old string or fs.appendFile(fd, oldString);
            fs.writeSync(fd, oldString, 0, oldString.length, newString.length);
            fs.close(fd);
            // 2. generate pwa manifest
            require('fs').writeFileSync(
                distPwaManifestPath,
                JSON.stringify({
                    "name": "React App Sample",
                    "short_name": "React App",
                    "start_url": "/index.html",
                    "icons": [
                        {
                            "src": "favicon.ico",
                            "sizes": "64x64 32x32 24x24 16x16",
                            "type": "image/x-icon"
                        }
                    ],
                    "theme_color": "#000000",
                    "background_color": "#ffffff",
                    "display": "standalone"
                })
            )
        });
    }
};

const config = {};
config.common = {
    entry: {
        main: './srcApp/main.js',
        // 1st option for service worker
        sw: './srcSw/sw.js',
    },
    module: {
        rules: [
            {
                include: [
                    srcAppPath,
                    // 1st option for service worker
                    srcSwPath
                ],
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        // https://babeljs.io/docs/en/presets
                        presets: ['@babel/preset-env', '@babel/react',],
                        plugins: [
                            // https://babeljs.io/docs/en/plugins
                            ['@babel/plugin-proposal-class-properties', {loose: true},],
                            '@babel/plugin-proposal-object-rest-spread',
                        ],
                        // cache in node_modules/.cache/
                        cacheDirectory: true,
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
                            name() {
                                // if under dev environment, no hash.
                                return process.argv.some(i => i === 'dev') ?
                                    '[folder]/[name].[ext]' :
                                    '[folder]/[name].[hash:20].[ext]'
                            },
                        },
                    }
                ]
            },
        ],
    },
    plugins: [
        htmlPlugin,
        namedModulesPlugin,
        // 2nd option for service worker
        // serviceWorkerPlugin,
        compressionPlugin,
        myPlugin,
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
                    name: 'node_modules',
                },
            }

        }
    }
};
config.dev = {
    // https://webpack.js.org/configuration/mode/#mode-development
    mode: 'development',
    // [In most cases, cheap-module-eval-source-map is the best option]
    // (https://webpack.js.org/guides/build-performance)
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: buildPath,
        hot: true,
        port: 3000,
    },
    // Don't use hash in development environment
    // https://webpack.js.org/guides/build-performance
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: buildPath,
        globalObject: 'this',
    },
    plugins: [
        hmrPlugin,
    ],
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

