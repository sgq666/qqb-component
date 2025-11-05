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

  // 在生产环境中确保静态资源可以添加请求头
  if (env === 'production') {
    // 为静态资源添加请求头的配置
    // 注意：这需要在服务器端配置，或者通过Service Worker实现
  }

  return config;
};