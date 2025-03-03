/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^store/(.*)$': '<rootDir>/src/store/$1',
    '^store$': '<rootDir>/src/store',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^types$': '<rootDir>/src/types',
    '^patterns/(.*)$': '<rootDir>/src/patterns/$1',
    '^patterns$': '<rootDir>/src/patterns',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^components$': '<rootDir>/src/components',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^utils$': '<rootDir>/src/utils'
  },
}; 