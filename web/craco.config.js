module.exports = {
  style: {
    postcss: {
      loaderOptions: options => {
        options.postcssOptions.plugins = options.postcssOptions.plugins.map(
          plugin => plugin === 'tailwindcss' ? '@tailwindcss/postcss' : plugin
        );
        return options;
      },
    },
  },
};
