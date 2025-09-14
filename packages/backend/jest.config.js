module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/shared/(.*)$': '<rootDir>/shared/$1',
    '^@/auth/(.*)$': '<rootDir>/auth/$1',
    '^@/reporting/(.*)$': '<rootDir>/reporting/$1',
    '^@/community/(.*)$': '<rootDir>/community/$1',
    '^@/admin/(.*)$': '<rootDir>/admin/$1',
  },
};