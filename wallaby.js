module.exports = function(wallaby) {
  return {
    env: {
      type: 'node',
      runner: 'node',
      params: {}
    },
    files: ['src/*.ts'],
    tests: ['test/*.ts'],
    testFramework: 'ava',
    workers: {
      restart: true
    }
  }
}
