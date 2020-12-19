# Tools [![license](https://img.shields.io/npm/l/get-changelog-lib?style=flat-square)](./LICENSE)

> Changelog analysis tools

## Install

```bash
cd packages/tools
npm install
```

## Popular package analysis

Collect data on popular npm packages (1000 by default):
`node src/fetchNpmTopPackages.js [nbPackage]`

This command generates a file (in the data directory) with newline separated json of popular packages data

## Chart generation

Generate pie charts representing common changelog location for active/inactive/total collected packages

`node src/generateCharts.js`
