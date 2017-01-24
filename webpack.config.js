var webpack = require('webpack');

module.exports = {
    entry: {
        index: 'Scripts/add_controls.js'
    },
    output: {
        path: 'Scripts/dist',
        filename: 'bundle.js'
    },
    module: {
        //加载器配置
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.js$/, loader: 'jsx-loader?harmony' },
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'}
        ]
    }
}