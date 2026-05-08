const flarumConfig = require('flarum-webpack-config');

const base = flarumConfig();

base.module.rules.push({
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
});

module.exports = base;
