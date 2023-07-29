// https://github.com/viruscamp/babel-plugin-transform-imports#using-a-function-as-the-transformer

const path = require('path');
const testsDir = path.resolve('./e2e/tests');
const testsBuiltDir = path.resolve('./e2e/dist');
const { readJSONSync } = require('fs-extra');

function resolvePath(pathToFile) {
  return `/${path
    .relative(
      process.cwd(),
      path.isAbsolute(pathToFile)
        ? pathToFile
        : path.resolve(process.cwd(), pathToFile)
    )
    .replaceAll(/\\/g, '/')}`;
}

function resolveModule(name) {
  return resolvePath(require.resolve(name));
}

function resolve(file) {
  const found = ['', '.ts', '/index.ts']
    .map((resolution) => `${file}${resolution}`)
    .find((file) => {
      try {
        return require.resolve(file);
      } catch (error) {
        return false;
      }
    });
  if (!found) {
    console.error(`Failed to resolve ${file}`);
    process.exit(1);
  }
  return require.resolve(found).replace(/\.ts$/, '.js');
}

module.exports = {
  extends: '../.babelrcAlt',
  plugins: [
    [
      'transform-imports',
      {
        '\\..*': {
          skipDefaultConversion: true,
          transform: function (importName, matches, filename) {
            const file = resolve(
              path.resolve(path.dirname(filename), `${matches[0]}`)
            );
            return `/${path
              .relative(
                process.cwd(),
                file.startsWith(testsDir)
                  ? path.resolve(testsBuiltDir, path.relative(testsDir, file))
                  : file
              )
              .replaceAll('\\', '/')}`;
          },
        },
        fabric: {
          skipDefaultConversion: true,
          transform: function () {
            return resolvePath(readJSONSync('./package.json').module);
          },
        },
        '.+': {
          skipDefaultConversion: true,
          transform: function (importName, [module], filename) {
            return resolveModule(module);
          },
        },
      },
    ],
  ],
};
