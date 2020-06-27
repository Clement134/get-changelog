# Contributing

Thanks for taking the time to contribute to this project!

## How to help?

There are multiple tasks you can do in order to help us, for example:
- fill an issue to report bugs or your specific needs
- contribute to existing issue
- write a PR to improve the project

## Repository structure

As a [lerna](https://lerna.js.org/) mono repository the code is split up in multiple packages:
- packages/get-changelog-cli for the CLI tool
- packages/get-changelog-lib for the library part (used by the CLI and for other packages)

All the `devDependencies` are hoisted in the root directory for easier maintenance.
Test files are marked by the `.test` suffix and are located near the files they correspond to.

## Set up

```bash
$ git clone https://github.com/Clement134/get-changelog.git && cd get-changelog
$ npm ci
$ npx lerna bootstrap
```

## Commands
### Linting

[ESlint](https://eslint.org/) is used for linting. It's recommended to add the corresponding extension to your editor. It's also possible to run the `lint` task with the following command: 
```bash
$ npm run lint
```

### Unit tests
Unit tests are written with [Jest](https://jestjs.io/). Tests can be started from the root folder.
```bash
$ npm test
```

### Local testing 
```bash
$ npm link
$ get-changelog
```
