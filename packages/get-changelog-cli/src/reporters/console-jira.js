/**
 * Colorize text depending on the upgradeType
 * @param {String} upgradeType type of upgrade (major, minor, patch)
 * @param {String} text text to colorize
 * @returns {String} colorized text
 */
function colorize(upgradeType, text) {
    if (upgradeType === 'major') return `{color:red}${text}{color}`;
    if (upgradeType === 'minor') return `{color:orange}${text}{color}`;
    return text;
}

/**
 * Print package informations on one line
 * @param {Object} data (name, from, to, changelog, upgradeType)
 */
function printTableLine({ name, from, to, changelog, upgradeType }) {
    const changelogLink = changelog ? `[${name} changelog|${changelog}]` : '?';
    console.log(`|${name}|${colorize(upgradeType, from)}|${colorize(upgradeType, to)}|${changelogLink}|`);
}

/**
 * Format data to make report
 * @param {Object} data report data
 * @returns {boolean} report written
 */
export function buildReport(data) {
    if (!data) {
        console.error('Unable to write report');
        return false;
    }
    if (data.length === 0) {
        console.log('No module to upgrade');
        return true;
    }

    console.log('||Package||From||To||Changelog||');
    const dependenciesData = data.filter(({ dependencyType }) => dependencyType === 'dependencies');

    if (dependenciesData.length > 0) {
        console.log('||dependencies|| || || ||');
        dependenciesData.forEach(printTableLine);
    }

    const devDependenciesData = data.filter(({ dependencyType }) => dependencyType === 'devDependencies');
    if (devDependenciesData.length > 0) {
        console.log('||devDependencies|| || || ||');
        devDependenciesData.forEach(printTableLine);
    }

    return true;
}

export default { buildReport };
