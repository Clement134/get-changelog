import terminalLink from 'terminal-link';
import Table from 'cli-table';

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    major: '\x1b[31m',
    minor: '\x1b[33m',
    patch: '\x1b[0m',
};

const TYPES = {
    major: 3,
    minor: 2,
    patch: 1,
};

/**
 * Format data to make report
 * @param {Object} data report data
 * @param {Object} options optional option object
 * @returns {boolean} report written
 */
export default function buildReport(data, options = {}) {
    if (!data) {
        console.error('Unable to write report');
        return false;
    }
    if (data.length === 0) {
        console.log('No module to upgrade');
        return true;
    }

    const table = new Table({
        head: [`${COLORS.reset}Package${COLORS.reset}`, `${COLORS.reset}Changelog`],
    });

    data.sort((packageA, packageB) => {
        if (packageA.dependencyType === packageB.dependencyType) return TYPES[packageB.upgradeType] - TYPES[packageA.upgradeType];
        if (packageA.dependencyType === 'devDependencies') return 1;
        return -1;
    }).forEach(({ name, from, to, changelog, upgradeType, dependencyType }) => {
        const changelogLink = options.url
            ? changelog
            : terminalLink(`Changelog ${name}`, changelog, {
                  fallback: () => changelog,
              });
        const rangeColor = COLORS[upgradeType];
        const versionString = `${rangeColor}${from} > ${to}${COLORS.reset}`;
        const typeDescription = dependencyType === 'devDependencies' ? '\x1b[34m[dev]\x1b[0m ' : '';
        table.push([`${typeDescription}${name} (${versionString})`, `${changelogLink || '?'}`]);
    });

    console.log(table.toString());
    console.log(
        `\n💡${COLORS.bright} Pro tips${COLORS.reset}:`,
        "If some changelog url aren't accurate, you can fill an issue in the repository:",
        'https://github.com/Clement134/get-changelog/issues/new?template=bad_url.md'
    );

    return true;
}
