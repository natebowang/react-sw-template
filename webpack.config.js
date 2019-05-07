const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const buildPath = path.resolve(__dirname, 'build');
const uglifyJsPlugin = new UglifyJsPlugin();
const copyPlugin = new CopyPlugin([{from: './srcStatic/', to: buildPath}]);

const config = {
    devtool: 'eval-source-map',
    entry: {
        'main': './srcMain/main.js',
        'sw': './srcSw/sw.js'
    },
    output: {
        path: buildPath,
        globalObject: 'this'
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
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [uglifyJsPlugin],
        usedExports: true,
        sideEffects: true,
    },
    plugins: [
        copyPlugin,
    ],
};

module.exports = config;
