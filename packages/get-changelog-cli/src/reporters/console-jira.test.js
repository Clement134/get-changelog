import { jest } from '@jest/globals';
import buildReport from './console-jira';

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
    const errorSpy = jest.spyOn(global.console, 'error');
    const logSpy = jest.spyOn(global.console, 'log');

    buildReport([
        {
            name: 'module1',
            from: '0.0.1',
            to: '1.0.0',
            changelog: 'http://module1.com',
            upgradeType: 'major',
            dependencyType: 'dependencies',
        },
        { name: 'module2', from: '0.0.1', to: '0.1.0', upgradeType: 'minor', dependencyType: 'dependencies' },
        {
            name: 'module3',
            from: '0.0.1',
            to: '0.0.2',
            changelog: 'http://module3.com',
            upgradeType: 'patch',
            dependencyType: 'devDependencies',
        },
    ]);
    expect(errorSpy).not.toBeCalled();
    expect(logSpy).nthCalledWith(1, '||Package||From||To||Changelog||');
    expect(logSpy).nthCalledWith(2, '||dependencies|| || || ||');
    expect(logSpy).nthCalledWith(3, '|module1|{color:red}0.0.1{color}|{color:red}1.0.0{color}|[module1 changelog|http://module1.com]|');
    expect(logSpy).nthCalledWith(4, '|module2|{color:orange}0.0.1{color}|{color:orange}0.1.0{color}|?|');
    expect(logSpy).nthCalledWith(5, '||devDependencies|| || || ||');
    expect(logSpy).nthCalledWith(6, '|module3|0.0.1|0.0.2|[module3 changelog|http://module3.com]|');
});
