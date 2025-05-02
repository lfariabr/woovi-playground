module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
    },
  },
  moduleNameMapper: {
    '^.+\\.(css|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '^react-relay$': '<rootDir>/__mocks__/relayMock.js',
  },
};
