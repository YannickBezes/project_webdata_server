const CopyWebpackPlugin = require('copy-webpack-plugin');
const root = require('app-root-path').path;
module.exports = {
    entry: `${root}/index.js`,
    target: 'node',
    externals: [
        /^[a-z\-0-9]+$/ // Ignore node_modules folder
    ],
    output: {
        filename: 'index.js', // output file
        path: `${root}/dist`,
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules', `${root}/src`]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: `${root}/package.json` },
            { from: `${root}/README.md` },
        ])
    ]
}; 
