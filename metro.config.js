const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Force Metro to prefer CJS (default condition) over ESM (import condition)
// for packages like zustand that ship ESM with import.meta (unsupported in
// Metro's classic bundle output).
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ["react-native", "require", "default"];

// Web shims: redirect native-only modules to web-compatible stubs
const _resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return {
      filePath: path.resolve(__dirname, "src/shims/react-native-maps.web.js"),
      type: "sourceFile",
    };
  }
  if (_resolveRequest) return _resolveRequest(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
