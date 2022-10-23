import { jest } from '@jest/globals';
import terminalLink from 'terminal-link';
import Table from 'cli-table';
import { buildReport } from './console.js';

jest.mock('terminal-link');
jest.mock('cli-table');

test('write error to console', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');
    buildReport();
    expect(errorSpy).toBeCalledWith('Unable to write report');
});

test('write data to console (no module to upgrade)', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');
    const logSpy = jest.spyOn(global.console, 'log');
    buildReport([]);
    expect(errorSpy).not.toBeCalled();
    expect(logSpy).toBeCalledWith('No module to upgrade');
});

test('write data to console', async () => {
    const tablePushSpy = jest.fn();
    Table.mockImplementation(() => ({
        push: tablePushSpy,
    }));
    const errorSpy = jest.spyOn(global.console, 'error');
    terminalLink.mockReturnValueOnce('[link]http://module1.com').mockReturnValueOnce(null).mockReturnValueOnce('[link]http://module3.com');

    buildReport([
        { name: 'module1', from: '0.0.1', to: '1.0.0', changelog: 'http://module1.com', upgradeType: 'major' },
        {
            name: 'module3',
            from: '0.0.1',
            to: '0.0.2',
            changelog: 'http://module3.com',
            upgradeType: 'patch',
            dependencyType: 'devDependencies',
        },
        { name: 'module2', from: '0.0.1', to: '0.1.0', upgradeType: 'minor' },
    ]);
    expect(errorSpy).not.toBeCalled();
    expect(tablePushSpy).nthCalledWith(1, ['module1 (\x1b[31m0.0.1 > 1.0.0\x1b[0m)', '[link]http://module1.com']);
    expect(tablePushSpy).nthCalledWith(2, ['module2 (\x1b[33m0.0.1 > 0.1.0\x1b[0m)', '?']);
    expect(tablePushSpy).nthCalledWith(3, ['\x1b[34m[dev]\x1b[0m module3 (\x1b[0m0.0.1 > 0.0.2\x1b[0m)', '[link]http://module3.com']);
});

test('write data to console (with link fallback)', async () => {
    const tablePushSpy = jest.fn();
    Table.mockImplementation(() => ({
        push: tablePushSpy,
    }));
    const errorSpy = jest.spyOn(global.console, 'error');
    terminalLink.mockImplementation((arg1, arg2, options) => options.fallback());

    buildReport([
        { name: 'module1', from: '0.0.1', to: '1.0.0', changelog: 'http://module1.com', upgradeType: 'major' },
        {
            name: 'module3',
            from: '0.0.1',
            to: '0.0.2',
            changelog: 'http://module3.com',
            upgradeType: 'patch',
            dependencyType: 'devDependencies',
        },
        { name: 'module2', from: '0.0.1', to: '0.1.0', upgradeType: 'minor' },
    ]);
    expect(errorSpy).not.toBeCalled();
    expect(tablePushSpy).nthCalledWith(1, ['module1 (\x1b[31m0.0.1 > 1.0.0\x1b[0m)', 'http://module1.com']);
    expect(tablePushSpy).nthCalledWith(2, ['module2 (\x1b[33m0.0.1 > 0.1.0\x1b[0m)', '?']);
    expect(tablePushSpy).nthCalledWith(3, ['\x1b[34m[dev]\x1b[0m module3 (\x1b[0m0.0.1 > 0.0.2\x1b[0m)', 'http://module3.com']);
});

test('write data to console (with url display)', async () => {
    const tablePushSpy = jest.fn();
    Table.mockImplementation(() => ({
        push: tablePushSpy,
    }));
    const errorSpy = jest.spyOn(global.console, 'error');

    buildReport(
        [
            { name: 'module1', from: '0.0.1', to: '1.0.0', changelog: 'http://module1.com', upgradeType: 'major' },
            {
                name: 'module3',
                from: '0.0.1',
                to: '0.0.2',
                changelog: 'http://module3.com',
                upgradeType: 'patch',
                dependencyType: 'devDependencies',
            },
            { name: 'module2', from: '0.0.1', to: '0.1.0', upgradeType: 'minor' },
        ],
        { url: true }
    );
    expect(errorSpy).not.toBeCalled();
    expect(terminalLink).not.toBeCalled();
    expect(tablePushSpy).nthCalledWith(1, ['module1 (\x1b[31m0.0.1 > 1.0.0\x1b[0m)', 'http://module1.com']);
    expect(tablePushSpy).nthCalledWith(2, ['module2 (\x1b[33m0.0.1 > 0.1.0\x1b[0m)', '?']);
    expect(tablePushSpy).nthCalledWith(3, ['\x1b[34m[dev]\x1b[0m module3 (\x1b[0m0.0.1 > 0.0.2\x1b[0m)', 'http://module3.com']);
});
