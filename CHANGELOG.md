# Changelog

This changelog is kept only for historical reasons.
There is one changelog for each package:

-   get-changelog-cli: [CHANGELOG](/packages/get-changelog-cli/CHANGELOG.md)
-   get-changelog-lib: [CHANGELOG](/packages/get-changelog-lib/CHANGELOG.md)

---

## 1.1.0

### Features

-   Use clickable links (#2)
-   Add `-o` option to automatically open changelog in browser (#2)

### Chore

-   Fix typo in readme and CLI helps (#2)
-   Upgrade dependencies and devDependencies

## 1.0.0

### Breaking change

-   Rename `-p` option in `-m`

### Feature

-   Add `--cache` option to use cache

### Refactor

-   Rewrite ChangelogFinder with ES6 class
-   Externalize logic in Runner class

### Tests

-   Add unit test for ChangelogFinder
-   Add unit test for console reporter
-   Add unit test for Runner

### Chore

-   Set up CI
-   Upgrade dependencies (got@10.7.0, npm-check-updates@4.1.2, semver@7.2.2)
-   Upgrade devDependencies (eslint-config-prettier@6.10.1, eslint-plugin-import@2.20.2, jest@25.3.0, prettier@2.0.4)

## 0.1.1

### Fixes

-   Upgrade dependencies to fix security issues

## 0.1.0

### Features

-   Add CLI spinner
-   Add support for verdaccio registry
-   Add support for bitbucket repositories
-   Add CHANGES.md has a possible changelog location

### Fixes

-   Fix git url parsing

## 0.0.1

-   Initial release
