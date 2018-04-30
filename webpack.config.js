const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
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
              configFile: "tsconfig.json",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "DEBUG": "true",
      "TARGET": JSON.stringify("browser"),
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
