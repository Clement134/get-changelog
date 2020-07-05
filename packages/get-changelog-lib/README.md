# get-changelog-lib [![version](https://img.shields.io/npm/v/get-changelog-lib?style=flat-square)](https://www.npmjs.com/package/get-changelog-lib) ![build](https://img.shields.io/github/workflow/status/Clement134/get-changelog/Node.js%20CI?style=flat-square) [![license](https://img.shields.io/npm/l/get-changelog-lib?style=flat-square)](./LICENSE)

> Library to get changelog url

## How it works

1. find git repository using npm registry
2. find changelog in the repository (changelog, history or changes files and github versions)
3. return changelog url

## Install

`npm install get-changelog-lib`

## Usage

```javascript
const ChangelogFinder = require('get-changelog-lib');

(async () => {
    const changeLogFinder = new ChangelogFinder();
    const changelogUrl = await changeLogFinder.getChangelog('express');
    console.log(changelogUrl); // https://github.com/expressjs/express/blob/master/History.md
})();
```

## Advanced usage

### GitHub token

Github API is used to fetch the default branch of each repository, this API is limited to 60 requests per hours. In order to increase this rate limit it's possible to add a github token (without specific permissions) in the `CHANGELOGFINDER_GITHUB_AUTH_TOKEN` environment variable.

### CLI integration

See [get-changelog-cli](https://www.npmjs.com/package/get-changelog-cli)

## License

MIT: [LICENSE](/LICENSE)
