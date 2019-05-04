const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const buildPath = path.resolve(__dirname, 'build');
const uglifyJsPlugin = new UglifyJsPlugin();
const copyPlugin = new CopyPlugin([{from: 'public', to: buildPath}]);

module.exports = {
    devtool: 'eval-source-map',
    output: {
        filename: 'main.js',
        path: buildPath
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