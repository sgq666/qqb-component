// config-overrides.js
module.exports = function override(config, env) {
  // 解决 xlsx-style 的 fs 模块问题
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    crypto: false,
    stream: false,
    buffer: false,
    util: false,
  };

  // 解决 xlsx-style 的 cptable 问题
  config.module.rules.push({
    test: /\.js$/,
    include: /node_modules\/xlsx-style/,
    use: {
      loader: "babel-loader",
      options: {
        presets: [["@babel/preset-env", { targets: { node: "current" } }]],
      },
    },
  });

  // 添加别名解决 cptable 问题
  config.resolve.alias = {
    ...config.resolve.alias,
    "./cptable": "xlsx-style/dist/cpexcel.js",
  };

  return config;
};
