const ora = require('ora');
const ncu = require('npm-check-updates');
const Runner = require('./Runner');
const ChangelogFinder = require('./ChangelogFinder');
const { buildReport } = require('./reporters/console');

jest.mock('ora');
jest.mock('npm-check-updates');
jest.mock('./ChangelogFinder');
jest.mock('./reporters/console');

ora.mockImplementation(() => ({
    start: () => ({
        stop: () => {},
    }),
}));

test('print changelog url', async () => {
    const logSpy = jest.spyOn(global.console, 'log');
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const runner = new Runner({ module: 'moduleName' });
    await runner.run();
    expect(getChangelogStub).toBeCalledWith('moduleName');
    expect(logSpy).toBeCalledWith('http://changelog.com');
});

test('print nothing (all module are up to date)', async () => {
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const runner = new Runner({ check: true });
    await runner.run();
    expect(getChangelogStub).not.toBeCalled();
    expect(buildReport).toBeCalledWith([]);
});

test('print changelogs', async () => {
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ncu.run = jest.fn().mockResolvedValue({ module: '^1.0.0' });
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const runner = new Runner({ check: true, packageFileOption: './mocks/valid' });
    await runner.run();
    expect(getChangelogStub).toBeCalledWith('module', '0.0.1');
    expect(buildReport).toBeCalledWith([
        {
            changelog: 'http://changelog.com',
            dependencyType: 'dependencies',
            from: '0.0.1',
            name: 'module',
            to: '1.0.0',
            upgradeType: 'major',
        },
    ]);
});
