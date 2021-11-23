module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};

process.env = Object.assign(process.env, { TABLE_NAME: 'MyTodoList-dev-todo-table' });
