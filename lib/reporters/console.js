const COLORS = {
    reset: '\x1b[0m',
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
        const rangeColor = COLORS[upgradeType];
        const versionString = `${rangeColor}${from} > ${to}${COLORS.reset}`;
        const typeDescription = dependencyType === 'devDependencies' ? '\x1b[34m[dev]\x1b[0m ' : '';
        console.log(`- ${typeDescription}${name} (${versionString}): ${changelog || '?'}`);
    });
    return true;
}

module.exports = {
    buildReport,
};
