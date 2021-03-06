const got = require('got');
const registryUrl = require('registry-url');
const url = require('url');

const GithubAPI = require('./GithubAPI');
const specificChangelogLocations = require('../data/changelogs.json');

class ChangelogFinder {
    /**
     * @constructor
     * @param {Object} configuration custom configuration
     * @param {Object.<string, string>} configuration.customRepositories mapping between custom repositories identifier and source path
     * @param {Boolean} configuration.exploreTxtFiles explore files with txt extension
     * @param {Cache} [cache] optional cache object
     */
    constructor(configuration, cache) {
        this.configuration = configuration || {};
        this.cache = cache;
    }

    /**
     * Get package repository url from registry metadata
     * @private
     * @param {String} moduleName npm module name
     * @param {String} [moduleVersion] opional package version
     * @returns {Promise<String>} repository url
     */
    async _getRepositoryUrl(moduleName, moduleVersion) {
        const registry = registryUrl();
        if (!registry) return null;

        try {
            const moduleData = await got(`${registry}${moduleName}`).json();
            const currentVersion = moduleVersion || moduleData['dist-tags'].latest;
            const { url: repositoryUrl } = moduleData.versions[currentVersion].repository;

            const urlObject = new URL(repositoryUrl);
            const path = urlObject.pathname.replace('.git', '');
            return `https://${urlObject.host}${path}`;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    /**
     * Send a get request to a possible changelog location
     * @private
     * @param {String} repositoryUrl github repository url
     * @param {String} file changelog file name
     * @param {String} branch the branch where changelog might exist
     * @returns {Promise<String>} changelog url
     */
    async _tryChangelogLocation(repositoryUrl, file, branch) {
        const { customRepositories } = this.configuration;
        let sourcePath = 'blob';

        const { host } = url.parse(repositoryUrl);
        if (host.includes('bitbucket.org')) {
            sourcePath = 'src';
        } else if (host.includes('gitlab.com')) {
            sourcePath = '-/blob';
        }

        if (customRepositories) {
            Object.keys(customRepositories).forEach((repository) => {
                if (repositoryUrl.includes(repository)) {
                    sourcePath = customRepositories[repository];
                }
            });
        }

        const filePath = `${repositoryUrl}/${sourcePath}/${branch}/${file}`;
        try {
            const { statusCode } = await got.head(filePath, { followRedirect: false });
            if (statusCode === 200) return filePath;
            return null;
        } catch (error) {
            if (error.response && error.response.statusCode !== 404) {
                console.log(error);
            }
            return null;
        }
    }

    /**
     * Get npm package changelog
     * @public
     * @param {String} moduleName npm module name
     * @param {String} [moduleVersion] optional module version
     * @returns {Promise<String>} changelog url
     */
    async getChangelog(moduleName, moduleVersion) {
        if (this.cache && this.cache.get(moduleName)) return this.cache.get(moduleName);
        if (Object.keys(specificChangelogLocations).includes(moduleName)) return specificChangelogLocations[moduleName];

        const repositoryUrl = await this._getRepositoryUrl(moduleName, moduleVersion);
        if (!repositoryUrl) {
            console.log(`Repository for module ${moduleName} not found`);
            return null;
        }

        const githubAPI = new GithubAPI(repositoryUrl);

        let branch;
        const { host } = url.parse(repositoryUrl);
        if (host.includes('github.com') && githubAPI.isActivated()) {
            branch = await githubAPI.getDefaultBranch();
        }
        branch = branch || 'master';

        const extensions = ['md'];
        if (this.configuration.exploreTxtFiles) extensions.push('txt');

        const names = ['CHANGELOG', 'changelog', 'ChangeLog', 'History', 'HISTORY', 'CHANGES'];
        const possibleLocations = [];
        extensions.forEach((extension) => {
            names.forEach((name) => {
                possibleLocations.push(`${name}.${extension}`);
            });
        });

        // try all possible location for changelog (with priority)
        const defaultChangelog = `${repositoryUrl}/releases`;
        let changelog;
        for (let i = 0; i < possibleLocations.length; i++) {
            changelog = await this._tryChangelogLocation(repositoryUrl, possibleLocations[i], branch);
            if (changelog) break;
        }

        let changelogUrl = changelog;
        if (!changelog) {
            if (host.includes('github.com') && githubAPI.isActivated()) {
                const isChangelog = await githubAPI.isReleaseChangelog(repositoryUrl);
                changelogUrl = isChangelog ? defaultChangelog : null;
            } else {
                changelogUrl = defaultChangelog;
            }
        }

        if (this.cache) this.cache.set(moduleName, changelogUrl);

        return changelogUrl;
    }
}

module.exports = ChangelogFinder;
