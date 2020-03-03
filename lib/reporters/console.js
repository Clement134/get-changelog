const COLORS = {
    reset: '\x1b[0m',
    major: '\x1b[31m',
    minor: '\x1b[33m',
    patch: '\x1b[0m',
};

/**
 * Format data to make report
 * @param {Object} data report data
 */
function buildReport(data) {
    console.log('CHANGELOGS:');
    data.forEach(({ name, from, to, changelog, upgradeType, dependencyType }) => {
        const rangeColor = COLORS[upgradeType] || COLORS.reset;
        const versionString = `${rangeColor}${from} > ${to}${COLORS.reset}`;
        const typeDescription = dependencyType === 'devDependencies' ? '\x1b[34m[dev]\x1b[0m ' : '';
        console.log(`- ${typeDescription}${name} (${versionString}): ${changelog || '?'}`);
    });
}

module.exports = {
    buildReport,
};
