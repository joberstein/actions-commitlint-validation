/**
 * Base configuration:
 * https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/config-conventional/index.js
 */
module.exports = {
    extends: ['@commitlint/config-conventional'],
    formatter: '@commitlint/format',
    rules: {
        'body-case': [2, 'always', ['sentence-case']],
        'body-full-stop': [1, 'always', '.'],
        'body-max-line-length': [0],
        'footer-max-line-length': [0],
        'header-max-length': [0],
        'scope-case': [2, 'always', ['kebab-case']],
        'subject-case': [2, 'always', ['sentence-case']],
        'subject-full-stop': [1, 'always', '.'],
    },
}