module.exports = {
  mode: "production",
  entry: "./src/index.js",
  devtool: "cheap-module-source-map",
  output: {
    filename: "[name].js",
    path: __dirname + "/dist"
  },
};
