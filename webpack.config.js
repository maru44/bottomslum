const path = require("path");

module.exports = {
    entry: {
        index: path.resolve(__dirname, "static/src", "index.js")
    },
    output: {
        path: path.resolve(__dirname, "static/build")
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            }
        ]
    }
};