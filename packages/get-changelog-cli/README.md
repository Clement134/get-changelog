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
  -v, --version                  output the version number
  -c, --check                    check package.json upgrades using npm-check-updates
  -m, --module <moduleName>      get changelog for an npm module
  -r, --reporter <reporterName>  reporter to use (console, console-jira)
  -o, --open                     open changelog url with the default browser (only usable with -m)
  --cache                        use cache to improve performances
  -h, --help                     display help for command
```

### Examples

#### -m, --module

![Module example](/images/module-example.png)

#### -c, --check

![Check example](/images/check-example.png)

### Advanced usage

#### Reporters

It's possible to choose the reporter used with the `-r` option.
The following reporters are implemented:

| Name           | Description                                           |
| -------------- | ----------------------------------------------------- |
| `console`      | (default reporter) print packages data in the console |
| `console-jira` | print packages data in jira markup                    |

#### GitHub token

Github API is used to fetch the default branch of each repository, this API is limited to 60 requests per hours. In order to increase this rate limit it's possible to add a github token (without specific permissions) in the `CHANGELOGFINDER_GITHUB_AUTH_TOKEN` environment variable.

## API usage

See [get-changelog-lib](https://www.npmjs.com/package/get-changelog-lib)

## License

MIT: [LICENSE](/LICENSE)
