# get-changelog ![version](https://img.shields.io/npm/v/get-changelog?style=flat-square) ![license](https://img.shields.io/npm/l/get-changelog?style=flat-square) ![codecov](https://img.shields.io/codecov/c/github/Clement134/get-changelog?style=flat-square&token=9901e2953c0a42f9937bd0045cdc649b)

> A CLI tool to easily find changelogs

Searching for changelogs before upgrade is often a time consuming task. The purpose of this tool is to simplify this search using common changelog locations.

## How it works

1. find git repository using npm registry
2. find changelog in the repository (changelog, history or github versions)
3. output results in the terminal

## Install

`npm install -g get-changelog`

## CLI Usage

```
Usage: get-changelog [options]

Options:
  -v, --version              output the version number
  -c, --check                check package.json upgrades using npm-check-updates
  -m, --module <moduleName>  get changelog for an npm module
  -o, --open                 open changelog url with the default browser (only usable with -m)
  --cache                    use cache to improve performances
  -h, --help                 display help for command
```

### Examples

#### -m, --module

![Module example](/images/module-example.png)

#### -c, --check

![Check example](/images/check-example.png)

## API usage

```javascript
const ChangelogFinder = require('get-changelog');

(async () => {
    const changeLogFinder = new ChangelogFinder();
    const changelogUrl = await changeLogFinder.getChangelog('express');
    console.log(changelogUrl); // https://github.com/expressjs/express/blob/master/History.md
})();
```

## LICENSE

MIT: [LICENSE](/LICENSE)
