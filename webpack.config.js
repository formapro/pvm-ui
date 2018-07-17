module.exports = {
  mode: "development",
  entry: "./src/index.js",
  devtool: "cheap-module-source-map",
  output: {
    filename: "[name].js",
    path: __dirname + "/dist"
  },
};
