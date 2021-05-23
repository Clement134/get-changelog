# get-changelog-cli [![version](https://img.shields.io/npm/v/get-changelog-cli?style=flat-square)](https://www.npmjs.com/package/get-changelog-cli) ![build](https://img.shields.io/github/workflow/status/Clement134/get-changelog/Node.js%20CI?style=flat-square) [![license](https://img.shields.io/npm/l/get-changelog-cli?style=flat-square)](/LICENSE)

> A CLI tool to easily find changelogs

Searching for changelogs before upgrade is often a time-consuming task. The purpose of this tool is to simplify this search using common changelog locations.

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
  -b, --branches <branches>      comma separated list of additional branches to check (e.g. -b main,test)
  --cache                        use cache to improve performances
  --txt                          try to found changelog with txt extension
  -f, --filter <matches>         (ncu option) include only package names matching the given string, comma-or-space-delimited list, or /regex/
  -x, --reject <matches>         (ncu option) exclude packages matching the given string, comma-or-space-delimited list, or /regex/
  -g, --global                   (ncu option) check global packages instead of in the current project
  -n, --newest                   (ncu option) find the newest versions available instead of the latest stable versions
  -t, --greatest                 (ncu option) find the highest versions available instead of the latest stable versions
  --minimal                      (ncu option) do not upgrade newer versions that are already satisfied by the version range according to semver
  -h, --help                     display help for command
```

### Examples

#### -m, --module

![Module example](/images/module-example.png)

#### -c, --check

![Check example](/images/check-example.png)

Version checking can be configured using [npm-check-updates](https://github.com/raineorshine/npm-check-updates) options:

-   `-f, --filter` or `-x, --reject` to include/exclude some packages
-   `-n, --newest`, `-t, --greatest`, `--minimal` to choose which version to use
-   `-g, --global` to check global modules

### Advanced usage

#### Reporters

It's possible to choose the reporter used with the `-r` option.
The following reporters are implemented:

| Name          | Description                                           |
| ------------- | ----------------------------------------------------- |
| `console`     | (default reporter) print packages data in the console |
| `consoleJira` | print packages data in jira markup                    |

#### Additional branch check

By default changelog search are only performed on the `master` branch. It is possible to check additional branches (main branch for example) with the `-b` option or to add a GitHub token in order to fetch the default branch from the repository.

#### GitHub token

Github API is used to fetch the default branch and verify releases of each repository, this API is limited to 60 requests per hours. In order to increase this rate limit it's possible to add a github token (without specific permissions) in the `CHANGELOGFINDER_GITHUB_AUTH_TOKEN` environment variable.

The procedure to generate this token is described on the [github documentation](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token#creating-a-token).

This tool could be a little less accurate (but more performant) without this token. As no default branch or release verification are performed.

## API usage

See [get-changelog-lib](https://www.npmjs.com/package/get-changelog-lib)

## License

MIT: [LICENSE](/LICENSE)
