# get-changelog-lib [![version](https://img.shields.io/npm/v/get-changelog-lib?style=flat-square)](https://www.npmjs.com/package/get-changelog-lib) [![license](https://img.shields.io/npm/l/get-changelog-lib?style=flat-square)](./LICENSE)

> Library to get changelog url

## How it works

1. find git repository using npm registry
2. find changelog in the repository (changelog, history or github versions)
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

### CLI integration

See [get-changelog-cli](https://www.npmjs.com/package/get-changelog-cli)

## License

MIT: [LICENSE](/LICENSE)
