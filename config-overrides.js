const {
  override,
  fixBabelImports,
  removeModuleScopePlugin,
} = require("customize-cra");
module.exports = override(
  removeModuleScopePlugin(),
  fixBabelImports("antd", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: "css",
  }),
  fixBabelImports("uiheader", {
    libraryName: "uiheader",
    libraryDirectory: "esm",
    camel2DashComponentName:false,
    style: "css",
  }),
  fixBabelImports("ahooks", {
    libraryName: "ahooks",
    libraryDirectory: "es",
    camel2DashComponentName: false
  }),
);
