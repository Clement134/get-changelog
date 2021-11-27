# Changelog

## 3.0.0

### Chore

-   **BREAKING CHANGE**: drop support for node 10.x
-   Upgrade dependencies

## 2.1.0

### Features

-   Add `branches` configuration to search changelog files in additional branches
-   Search for changelog files in mono repository

### Chore

-   Upgrade dependencies

## 2.0.2

### Chore

-   Upgrade dependencies

## 2.0.1

### Fix

-   Remove additonal `console.log` (#71)

## 2.0.0

### Feature

-   **BREAKING CHANGE**: add option `—txt` to explore txt files (no more the default)
-   **BREAKING CHANGE**: refactor github calls (no default branch detection and release analysis without github token)
-   Automatically suggest issue creation if changelog not found
-   Improve accuracy for npm most popular packages (top 1000)
-   Add support for gitlab
-   Use head request to improve performances
-   Sort packages in console reporter
-   render console output as table

### Chore

-   Upgrade dependencies

## 1.5.0

### Feature

-   Improve accuracy for npm most popular packages (top 500)

### Chore

-   Upgrade dependencies

## 1.4.0

### Fix

-   Fix verification of registry url

### Chore

-   Upgrade dependencies

## 1.3.0

### Chore

-   Upgrade dependencies

## 1.2.0

### Feature

-   Add exceptions for packages that doesn't follow the convention for changelog location

### Chore

-   Upgrade dependencies
-   Enforce best practices and code style with eslint and prettier
-   Improve test coverage

## 1.1.0

### Features

-   Use default branch for github repositories (PR #6, @exoego)
-   Check changelogs in .txt files (PR #5, @exoego)

## 1.0.1

### Fixes

-   Fix bin path

## 1.0.0

-   Initial release
