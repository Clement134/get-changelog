const got = require('got');
const registryUrl = require('registry-url');

/**
 * Get package repository url from registry metadata
 * @param {String} packageName npm package name
 * @returns {Promise<String>} repository url
 */
async function getRepositoryUrl(packageName) {
    const registry = registryUrl();

    try {
        const {
            repository: { url },
        } = await got(`${registry}${packageName}`).json();
        return url
            .replace('git+', '')
            .replace('git:', 'https:')
            .replace('.git', '');
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Send a get request to a possible changelog location
 * @param {String} repositoryUrl github repository url
 * @param {String} file changelog file name
 * @returns {Promise<String>} changelog url
 */
async function tryChangelogLocation(repositoryUrl, file) {
    try {
        const filePath = `${repositoryUrl}/blob/master/${file}`;
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
 * @returns {Promise<String>} changelog url
 */
async function getChangelog(packageName) {
    const repositoryUrl = await getRepositoryUrl(packageName);
    if (!repositoryUrl) {
        console.log(`Repository for package ${packageName} not found`);
        return null;
    }

    // try all possible location for changelog (with priority)
    const possibleLocations = ['CHANGELOG.md', 'changelog.md', 'History.md', 'HISTORY.md', 'CHANGES.md'];
    const defaultChangelog = `${repositoryUrl}/releases`;
    let changelog;
    for (let i = 0; i < possibleLocations.length; i++) {
        changelog = await tryChangelogLocation(repositoryUrl, possibleLocations[i]);
        if (changelog) break;
    }

    return changelog || defaultChangelog;
}

module.exports = {
    getChangelog,
};
