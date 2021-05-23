import fs from 'fs/promises';
import ora from 'ora';
import ncu from 'npm-check-updates';
import semver from 'semver';
import openUrl from 'open';
import ChangelogFinder from 'get-changelog-lib';

import Cache from './Cache';
import reporters, { console } from './reporters';

const spinnerConfig = { spinner: 'simpleDots' };
const VERSION_DATA_EXTRACTOR = /(?:npm:(.+)@)?(.*)/;

/**
 * @typedef {Object} VersionData
 * @property {String} [name] module name
 * @property {String} version semver version (ex 1.3.2)
 */
/**
 * Transform semver range to semver version
 * @param {String} range package range (ex: ^1.3.2, npm:bootstrap@^5.1.3)
 * @returns {VersionData} version data
 */
function extractVersionData(range) {
    const [, name, semverRangeWithoutAlias] = range.match(VERSION_DATA_EXTRACTOR);
    return {
        name,
        version: semverRangeWithoutAlias.replace('^', '').replace('~', ''),
    };
}

export default class Runner {
    /**
     * @constructor
     * @param {Object} options run options
     */
    constructor(options) {
        this.options = options || {};
        this.options.reporter = options.reporter || 'console';
    }

    /**
     * Parse configuration file
     */
    async _parseConfiguration() {
        let configuration = {};
        try {
            const configPath = this.options.configurationFilePath || '../config.json';
            const configFile = await fs.readFile(configPath);
            configuration = JSON.parse(configFile);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error('Invalid configuration file');
            }
        }
        return configuration;
    }

    /**
     * Execute program
     */
    async run() {
        const configuration = await this._parseConfiguration();
        configuration.cache = Boolean(this.options.cache);
        configuration.exploreTxtFiles = Boolean(this.options.txt);
        configuration.branches = this.options.branches ? this.options.branches.split(',') : [];

        let cache;
        if (configuration.cache) {
            cache = new Cache();
            cache.init();
        }

        const changelogFinder = new ChangelogFinder(configuration, cache);
        const { module: moduleName, check, open, packageFileOption } = this.options;

        if (moduleName && !check) {
            const spinner = ora(spinnerConfig).start('searching changelog');
            const changelog = await changelogFinder.getChangelog(moduleName);
            spinner.stop();

            if (changelog) {
                console.log(changelog);
                if (open) await openUrl(changelog);
            } else {
                console.log(
                    'Changelog not found\nyou can report this issue with this link:',
                    'https://github.com/Clement134/get-changelog/issues/new?template=bad_url.md'
                );
            }
        }

        if (check && !moduleName) {
            const ncuOptions = {
                filter: this.options.filter,
                global: this.options.global,
                minimal: this.options.minimal,
                newest: this.options.newest,
                greatest: this.options.greatest,
                reject: this.options.reject,
            };
            if (packageFileOption) {
                ncuOptions.packageFile = packageFileOption;
            }

            // get dependencies to upgrade
            const modulesToUpgrade = (await ncu.run(ncuOptions)) || {};
            // get current versions
            const packageFilePath = packageFileOption || `${process.cwd()}/package.json`;
            const packageFile = await fs.readFile(packageFilePath);
            let packageData;
            try {
                packageData = JSON.parse(packageFile);
            } catch (err) {
                console.error(`Invalid package.json file in ${packageFilePath}`);
                return process.exit();
            }
            const dependencies = packageData.dependencies || {};
            const devDependencies = packageData.devDependencies || {};
            const allDependencies = { ...dependencies, ...devDependencies };

            // find changelogs
            const spinner = ora(spinnerConfig).start('searching changelogs');
            const changelogResolvers = Object.keys(modulesToUpgrade).map((dependencyName) => {
                const currentVersionData = extractVersionData(allDependencies[dependencyName]);
                const currentVersion = currentVersionData.version;
                const newVersionData = extractVersionData(modulesToUpgrade[dependencyName]);
                const newVersion = newVersionData.version;

                // use module name from version for npm aliases
                const currentModuleName = currentVersionData.name ? currentVersionData.name : dependencyName;
                const dependencyType = dependencies[dependencyName] ? 'dependencies' : 'devDependencies';

                return new Promise((resolve) => {
                    changelogFinder.getChangelog(currentModuleName, newVersion).then((changelog) => {
                        const data = { name: dependencyName, changelog, dependencyType };
                        if (currentVersion) data.from = currentVersion;
                        if (newVersion) data.to = newVersion;

                        data.upgradeType = semver.diff(data.from, data.to);
                        spinner.text = `searching changelog for ${dependencyName}`;
                        return resolve(data);
                    });
                });
            });
            const data = await Promise.all(changelogResolvers);

            spinner.stop();
            // format output
            const reporter = reporters[this.options.reporter] || console;
            reporter.buildReport(data);
        }

        if (configuration.cache) cache.write();
        return 0;
    }
}
