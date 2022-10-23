#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import Runner from '../src/Runner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));

program
    .version(packageJson.version, '-v, --version')
    .option('-c, --check', 'check package.json upgrades using npm-check-updates')
    .option('-m, --module <moduleName>', 'get changelog for an npm module')
    .option('-r, --reporter <reporterName>', 'reporter to use (console, console-jira)')
    .option('-u, --url', 'force url rendering instead of hyperlink for console reporter')
    .option('-o, --open', 'open changelog url with the default browser (only usable with -m)')
    .option('-b, --branches <branches>', 'comma separated list of additional branches to check (e.g. -b main,test)')
    .option('--cache', 'use cache to improve performances')
    .option('--txt', 'try to found changelog with txt extension')
    .option(
        '-f, --filter <matches>',
        '(ncu option) include only package names matching the given string, comma-or-space-delimited list, or /regex/'
    )
    .option('-x, --reject <matches>', '(ncu option) exclude packages matching the given string, comma-or-space-delimited list, or /regex/')
    .option('-g, --global', '(ncu option) check global packages instead of in the current project')
    .option('-n, --newest', '(ncu option) find the newest versions available instead of the latest stable versions')
    .option('-t, --greatest', '(ncu option) find the highest versions available instead of the latest stable versions')
    .option('--minimal', '(ncu option) do not upgrade newer versions that are already satisfied by the version range according to semver');

program.parse(process.argv);

(async () => {
    const options = program.opts();
    const runner = new Runner(options);
    await runner.run();
})();
