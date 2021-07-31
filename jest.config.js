/* eslint-env commonjs */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  globals: {},
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.ts$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@t/(.*)$': '<rootDir>/types/$1'
  },
  moduleFileExtensions: ['vue', 'js', 'ts', 'json'],
  testMatch: ['**/__tests__/**/*.spec.ts']
}
