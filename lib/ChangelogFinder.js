const got = require('got');
const registryUrl = require('registry-url');

class ChangelogFinder {
    /**
     * @constructor
     * @param {Object} configuration custom configuration
     * @param {Object.<string, string>} configuration.customRepositories mapping between custom repositories identifier and source path
     */
    constructor(configuration) {
        this.configuration = configuration;
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
     * @returns {Promise<String>} changelog url
     */
    async _tryChangelogLocation(repositoryUrl, file) {
        const { customRepositories } = this.configuration;
        let sourcePath = 'blob';
        if (repositoryUrl.includes('bitbucket.org')) {
            sourcePath = 'src';
        }

        if (customRepositories) {
            Object.keys(customRepositories).forEach((repository) => {
                if (repositoryUrl.includes(repository)) {
                    sourcePath = customRepositories[repository];
                }
            });
        }

        const filePath = `${repositoryUrl}/${sourcePath}/master/${file}`;

        try {
            await got(filePath);
            return filePath;
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
        const repositoryUrl = await this._getRepositoryUrl(moduleName, moduleVersion);
        if (!repositoryUrl) {
            console.log(`Repository for module ${moduleName} not found`);
            return null;
        }

        // try all possible location for changelog (with priority)
        const possibleLocations = ['CHANGELOG.md', 'changelog.md', 'History.md', 'HISTORY.md', 'CHANGES.md'];
        const defaultChangelog = `${repositoryUrl}/releases`;
        let changelog;
        for (let i = 0; i < possibleLocations.length; i++) {
            changelog = await this._tryChangelogLocation(repositoryUrl, possibleLocations[i]);
            if (changelog) break;
        }

        return changelog || defaultChangelog;
    }
}

module.exports = ChangelogFinder;
