# get-changelog-cli [![version](https://img.shields.io/npm/v/get-changelog-cli?style=flat-square)](https://www.npmjs.com/package/get-changelog-cli) [![license](https://img.shields.io/npm/l/get-changelog-cli?style=flat-square)](/LICENSE)

> A CLI tool to easily find changelogs

Searching for changelogs before upgrade is often a time consuming task. The purpose of this tool is to simplify this search using common changelog locations.

## How it works

1. find git repository using npm registry
2. find changelog in the repository (changelog, history or github versions)
3. output results in the terminal

## Install

`npm install -g get-changelog-cli`

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

See [get-changelog-lib](https://www.npmjs.com/package/get-changelog-lib)

## License

MIT: [LICENSE](/LICENSE)
