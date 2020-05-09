const ora = require('ora');
const ncu = require('npm-check-updates');
const open = require('open');
const ChangelogFinder = require('get-changelog-lib');

const Runner = require('./Runner');
const Cache = require('./Cache');
const { buildReport } = require('./reporters/console');

jest.mock('ora');
jest.mock('npm-check-updates');
jest.mock('open');
jest.mock('get-changelog-lib');
jest.mock('./Cache');
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

test('print and open changelog url', async () => {
    const logSpy = jest.spyOn(global.console, 'log');
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const runner = new Runner({ module: 'moduleName', open: true });
    await runner.run();
    expect(getChangelogStub).toBeCalledWith('moduleName');
    expect(logSpy).toBeCalledWith('http://changelog.com');
    expect(open).toBeCalled();
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

test('print changelogs (without cache)', async () => {
    ncu.run = jest.fn().mockResolvedValue({ module: '^1.0.0' });
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const writeSpy = jest.fn();
    Cache.mockImplementation(() => ({
        write: writeSpy,
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
    expect(writeSpy).not.toBeCalled();
});

test('print changelogs (with cache)', async () => {
    ncu.run = jest.fn().mockResolvedValue({ module: '^1.0.0' });
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const initSpy = jest.fn();
    const writeSpy = jest.fn();
    Cache.mockImplementation(() => ({
        init: initSpy,
        write: writeSpy,
    }));
    const runner = new Runner({ check: true, packageFileOption: './mocks/valid', cache: true });
    await runner.run();
    expect(initSpy).toBeCalled();
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
    expect(writeSpy).toBeCalled();
});
