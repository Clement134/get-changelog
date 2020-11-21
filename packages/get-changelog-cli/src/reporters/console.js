const terminalLink = require('terminal-link');

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    major: '\x1b[31m',
    minor: '\x1b[33m',
    patch: '\x1b[0m',
};

/**
 * Format data to make report
 * @param {Object} data report data
 * @returns {boolean} report written
 */
function buildReport(data) {
    if (!data) {
        console.error('Unable to write report');
        return false;
    }
    if (data.length === 0) {
        console.log('No module to upgrade');
        return true;
    }

    console.log('CHANGELOGS:');
    data.forEach(({ name, from, to, changelog, upgradeType, dependencyType }) => {
        const changelogLink = terminalLink('Changelog', changelog, {
            fallback: () => changelog,
        });
        const rangeColor = COLORS[upgradeType];
        const versionString = `${rangeColor}${from} > ${to}${COLORS.reset}`;
        const typeDescription = dependencyType === 'devDependencies' ? '\x1b[34m[dev]\x1b[0m ' : '';
        console.log(`- ${typeDescription}${name} (${versionString}): ${changelogLink || '?'}`);
    });

    console.log(
        `\n💡${COLORS.bright} Pro tips${COLORS.reset}:`,
        "If some changelog url aren't accurate, you can fill an issue in the repository:",
        'https://github.com/Clement134/get-changelog/issues/new?template=bad_url.md'
    );

    return true;
}

module.exports = {
    buildReport,
};
