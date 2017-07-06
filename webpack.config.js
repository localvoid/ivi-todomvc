const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/main.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFileName: "tsconfig.json",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "__IVI_DEV__": true,
      "__IVI_BROWSER__": true,
    }),
    new webpack.SourceMapDevToolPlugin({
      test: /\.(ts|js)$/,
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
  devServer: {
    port: 9000,
    host: "localhost",
    historyApiFallback: true,
    noInfo: false,
    stats: "minimal",
    contentBase: path.join(__dirname, "public"),
  },
};
