# get-changelog

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
  -v, --version            output the version number
  -c, --check              check package.json upgrades using npm check upgrades
  -p, --package <package>  get changelog for a npm package
  -h, --help               output usage information
```

### Examples

#### -p, --package

![Package example](/images/package-example.png)

#### -c, --check

![Check example](/images/check-example.png)

## API usage

```javascript
const { getChangelog } = require('get-changelog');

(async () => {
    const changelog = await getChangelog('express');
})();
```

## LICENSE

MIT: [LICENSE](/LICENSE)
