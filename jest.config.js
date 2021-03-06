/* eslint-env commonjs */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  globals: {},
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.ts$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@t/(.*)$': '<rootDir>/types/$1'
  },
  moduleFileExtensions: ['vue', 'js', 'ts', 'json'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  setupFiles: ['./configEnv.ts']
}
