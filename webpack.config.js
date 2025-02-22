const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['msw'],
    },
  }, argv);

  // Copy MSW service worker to output directory
  config.plugins.push({
    apply: (compiler) => {
      compiler.hooks.afterEmit.tap('CopyMSWFiles', (compilation) => {
        require('fs').copyFileSync(
          path.resolve(__dirname, 'public/mockServiceWorker.js'),
          path.resolve(__dirname, 'web-build/mockServiceWorker.js')
        );
      });
    },
  });

  return config;
};
