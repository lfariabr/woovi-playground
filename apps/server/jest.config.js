const pack = require('./package.json');

// Updated jestTransformer to ensure .ts/.tsx files are ALWAYS handled by ts-jest, and .js/.jsx by Babel or custom transformer.
const jestTransformer = () => {
  if (process.env.JEST_TRANSFORMER === 'babel-barrel') {
    // eslint-disable-next-line
    console.log('babel-barrel');
    return {
      '^.+\\.(ts|tsx)$': 'ts-jest', // Always use ts-jest for TypeScript
      '^.+\\.(js|jsx)$': require.resolve('./babelBarrel'), // JS/JSX handled by custom transformer
    };
  }

  // eslint-disable-next-line
  console.log('babel-jest');
  return {
    '^.+\\.(ts|tsx)$': 'ts-jest',    // Always use ts-jest for TypeScript
    '^.+\\.(js|jsx)$': 'babel-jest', // Use babel-jest for JS/JSX
  };
};

module.exports = {
  displayName: pack.name,
  testPathIgnorePatterns: ['/node_modules/', './dist'],
  resetModules: false,
  transform: {
    ...jestTransformer(),
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx)?$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json'],
};
