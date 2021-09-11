# Changelog

## 2.0.2

### Chore

-   Upgrade dependencies

## 2.0.1

### Chore

-   Upgrade dependencies

## 2.0.0

### Feature

-   **BREAKING CHANGE**: add option `—txt` to explore txt files (no more the default)
-   **BREAKING CHANGE**: refactor github calls (no default branch detection and release analysis without github token)
-   Improve accuracy for npm most popular packages (top 1000)
-   Add support for gitlab
-   Use head request to improve performances

### Chore

-   Upgrade dependencies

## 1.6.0

### Feature

-   Automatically suggest issue creation if changelog file not found

### Chore

-   Upgrade dependencies

## 1.5.0

### Fix

-   Find changelog for latest version instead of current one to prevent errors with version removed from registry

### Chore

-   Upgrade dependencies

## 1.4.0

### Feature

-   Add options for [npm-check-updates](https://github.com/raineorshine/npm-check-updates) configuration (filtering, versions preferences...)

### Chore

-   Upgrade dependencies

## 1.3.0

### Feature

-   Add exceptions for packages that doesn't follow the convention for changelog location
-   Display package version in the CLI (-v option)

### Chore

-   Upgrade dependencies
-   Enforce best practices and code style with eslint and prettier
-   Improve test coverage

## 1.2.0

-   Upgrade get-changelog-lib@1.1.0

## 1.1.0

### Feature

-   Add `-r` option to choose reporter
-   Add `console-jira` reporter

## 1.0.0

-   Initial release
