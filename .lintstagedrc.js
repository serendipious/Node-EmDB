module.exports = {
  'src/**/*.ts': [
    'eslint --fix',
    'git add'
  ],
  'lib/**/*.ts': [
    'eslint --fix',
    'git add'
  ]
};
