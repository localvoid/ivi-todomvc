"use strict";

const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = merge(require("./webpack.common"), {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    contentBase: "./dist",
    port: 9000,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.IVI_TARGET": `"browser"`,
    }),
    new CopyWebpackPlugin([
      { from: "assets/", to: "" },
    ]),
    new HtmlWebpackPlugin({
      inject: true,
      template: "html/index.html",
    }),
  ],
  serve: {
    content: [
      path.resolve(__dirname, "assets"),
    ],
  },
});
