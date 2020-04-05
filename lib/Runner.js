const fs = require('fs').promises;
const ora = require('ora');
const ncu = require('npm-check-updates');
const semver = require('semver');

const ChangelogFinder = require('./ChangelogFinder');
const Cache = require('./Cache');
const { buildReport } = require('./reporters/console');

const spinnerConfig = { spinner: 'simpleDots' };

/**
 * Transform semver range to semver version
 * @param {String} semverRange semver range (ex: ^1.3.2)
 * @returns {String} semver version (ex: 1.3.2)
 */
function rangeToVersion(semverRange) {
    return semverRange.replace('^', '').replace('~', '');
}

class Runner {
    /**
     * @constructor
     * @param {Object} options run options
     */
    constructor(options) {
        this.options = options || {};
    }

    /**
     * Parse configuration file
     */
    async _parseConfiguration() {
        let configuration = {};
        try {
            const configFile = await fs.readFile('../config.json');
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

        let cache;
        if (configuration.cache) {
            cache = new Cache();
            cache.init();
        }

        const changelogFinder = new ChangelogFinder(configuration, cache);
        const { module: moduleName, check, packageFileOption } = this.options;

        if (moduleName && !check) {
            const spinner = ora(spinnerConfig).start('searching changelog');
            const changelog = await changelogFinder.getChangelog(moduleName);
            spinner.stop();
            console.log(changelog);
        }

        if (check && !moduleName) {
            const ncuOptions = {};
            if (packageFileOption) {
                ncuOptions.packageFile = packageFileOption;
            }

            // get dependencies to upgrade
            const modulesToUpgrade = (await ncu.run(ncuOptions)) || {};

            // get current versions
            const packageFilePath = packageFileOption || process.cwd();
            const packageFile = await fs.readFile(`${packageFilePath}/package.json`);
            let packageData;
            try {
                packageData = JSON.parse(packageFile);
            } catch (err) {
                console.log(`Invalid package.json file in ${packageFilePath}`);
                process.exit();
            }
            const dependencies = packageData.dependencies || {};
            const devDependencies = packageData.devDependencies || {};
            const allDependencies = { ...dependencies, ...devDependencies };

            // find changelogs
            const spinner = ora(spinnerConfig).start('searching changelogs');
            const changelogResolvers = Object.keys(modulesToUpgrade).map((dependencyName) => {
                const currentVersion = rangeToVersion(allDependencies[dependencyName]);
                const newVersion = rangeToVersion(modulesToUpgrade[dependencyName]);
                const dependencyType = dependencies[dependencyName] ? 'dependencies' : 'devDependencies';
                return new Promise((resolve) => {
                    changelogFinder.getChangelog(dependencyName, currentVersion).then((changelog) => {
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
            buildReport(data);
        }

        if (configuration.cache) cache.write();
    }
}

module.exports = Runner;
