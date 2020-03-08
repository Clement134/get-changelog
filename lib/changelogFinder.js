const got = require('got');
const registryUrl = require('registry-url');

/**
 * Get package repository url from registry metadata
 * @param {String} packageName npm package name
 * @param {String} [version] opional package version
 * @returns {Promise<String>} repository url
 */
async function getRepositoryUrl(packageName, version) {
    const registry = registryUrl();
    try {
        const packageData = await got(`${registry}${packageName}`).json();
        const currentVersion = version || packageData['dist-tags'].latest;
        const { url: repositoryUrl } = packageData.versions[currentVersion].repository;

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
 * @param {String} repositoryUrl github repository url
 * @param {Object} configuration custom configuration
 * @param {Object} configuration.customRepositories mapping between custom repositories and source path
 * @param {String} file changelog file name
 * @returns {Promise<String>} changelog url
 */
async function tryChangelogLocation(repositoryUrl, { customRepositories }, file) {
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
 * get npm package changelog
 * @param {String} packageName npm package name
 * @param {Object} configuration custom configuration
 * @param {String} [version] optional package version
 * @returns {Promise<String>} changelog url
 */
async function getChangelog(packageName, configuration, version) {
    const repositoryUrl = await getRepositoryUrl(packageName, version);
    if (!repositoryUrl) {
        console.log(`Repository for package ${packageName} not found`);
        return null;
    }

    // try all possible location for changelog (with priority)
    const possibleLocations = ['CHANGELOG.md', 'changelog.md', 'History.md', 'HISTORY.md', 'CHANGES.md'];
    const defaultChangelog = `${repositoryUrl}/releases`;
    let changelog;
    for (let i = 0; i < possibleLocations.length; i++) {
        changelog = await tryChangelogLocation(repositoryUrl, configuration, possibleLocations[i]);
        if (changelog) break;
    }

    return changelog || defaultChangelog;
}

module.exports = {
    getChangelog,
};
