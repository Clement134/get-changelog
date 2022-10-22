import { jest } from '@jest/globals';
import ora from 'ora';
import ncu from 'npm-check-updates';
import open from 'open';
import ChangelogFinder from 'get-changelog-lib';

import Runner from './Runner';
import Cache from './Cache';
import buildReport from './reporters/console';

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

test('[module] print changelog url', async () => {
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

test('[module] print and open changelog url', async () => {
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

test('[check] log error for invalid package.json and exit', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const runner = new Runner({ check: true, packageFileOption: './mocks/invalid/invalidPackage.json' });
    await runner.run();
    expect(errorSpy).toBeCalledWith('Invalid package.json file in ./mocks/invalid/invalidPackage.json');
    expect(exitSpy).toBeCalled();
});

test('[check] print nothing (all module are up to date)', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const runner = new Runner({ check: true, configurationFilePath: './mocks/invalid/invalidConfig.json' });
    await runner.run();
    expect(getChangelogStub).not.toBeCalled();
    expect(errorSpy).toBeCalledWith('Invalid configuration file');
    expect(buildReport).toBeCalledWith([], {
        check: true,
        configurationFilePath: './mocks/invalid/invalidConfig.json',
        reporter: 'console',
    });
});

test('[check] print nothing (all module are up to date)', async () => {
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const runner = new Runner({ check: true });
    await runner.run();
    expect(getChangelogStub).not.toBeCalled();
    expect(buildReport).toBeCalledWith([], { check: true, reporter: 'console' });
});

test('[check] print changelogs (without cache)', async () => {
    ncu.run = jest.fn().mockResolvedValue({ module: '^1.0.0' });
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const writeSpy = jest.fn();
    Cache.mockImplementation(() => ({
        write: writeSpy,
    }));
    const runner = new Runner({ check: true, packageFileOption: './mocks/valid/package.json' });
    await runner.run();
    expect(getChangelogStub).toBeCalledWith('module', '1.0.0');
    expect(buildReport).toBeCalledWith(
        [
            {
                changelog: 'http://changelog.com',
                dependencyType: 'dependencies',
                from: '0.0.1',
                name: 'module',
                to: '1.0.0',
                upgradeType: 'major',
            },
        ],
        { check: true, reporter: 'console', packageFileOption: './mocks/valid/package.json' }
    );
    expect(writeSpy).not.toBeCalled();
});

test('[check] print changelogs (using npm aliases)', async () => {
    ncu.run = jest.fn().mockResolvedValue({ moduleWithoutAlias: '^1.0.0', moduleWithAlias: 'npm:moduleWithoutAlias@^1.0.0' });
    const getChangelogStub = jest.fn().mockResolvedValue('http://changelog.com');
    ChangelogFinder.mockImplementation(() => ({
        getChangelog: getChangelogStub,
    }));
    const writeSpy = jest.fn();
    Cache.mockImplementation(() => ({
        write: writeSpy,
    }));
    const runner = new Runner({ check: true, packageFileOption: './mocks/with-aliases/package.json' });
    await runner.run();
    expect(getChangelogStub).toBeCalledWith('moduleWithoutAlias', '1.0.0');
    expect(buildReport).toBeCalledWith(
        [
            {
                changelog: 'http://changelog.com',
                dependencyType: 'dependencies',
                from: '0.0.1',
                name: 'moduleWithoutAlias',
                to: '1.0.0',
                upgradeType: 'major',
            },
            {
                changelog: 'http://changelog.com',
                dependencyType: 'dependencies',
                from: '0.0.2',
                name: 'moduleWithAlias',
                to: '1.0.0',
                upgradeType: 'major',
            },
        ],
        { check: true, reporter: 'console', packageFileOption: './mocks/with-aliases/package.json' }
    );
    expect(writeSpy).not.toBeCalled();
});

test('[check] print changelogs (with cache)', async () => {
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
    const runner = new Runner({ check: true, packageFileOption: './mocks/valid/package.json', cache: true });
    await runner.run();
    expect(initSpy).toBeCalled();
    expect(getChangelogStub).toBeCalledWith('module', '1.0.0');
    expect(buildReport).toBeCalledWith(
        [
            {
                changelog: 'http://changelog.com',
                dependencyType: 'dependencies',
                from: '0.0.1',
                name: 'module',
                to: '1.0.0',
                upgradeType: 'major',
            },
        ],
        { cache: true, packageFileOption: './mocks/valid/package.json', check: true, reporter: 'console' }
    );
    expect(writeSpy).toBeCalled();
});
