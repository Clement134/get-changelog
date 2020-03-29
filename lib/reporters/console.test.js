const { buildReport } = require('./console');

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
        { name: 'module1', from: '0.0.1', to: '1.0.0', changelog: 'http://module1.com', upgradeType: 'major' },
        { name: 'module2', from: '0.0.1', to: '0.1.0', upgradeType: 'minor' },
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
    expect(logSpy).nthCalledWith(1, 'CHANGELOGS:');
    expect(logSpy).nthCalledWith(2, '- module1 (\x1b[31m0.0.1 > 1.0.0\x1b[0m): http://module1.com');
    expect(logSpy).nthCalledWith(3, '- module2 (\x1b[33m0.0.1 > 0.1.0\x1b[0m): ?');
    expect(logSpy).nthCalledWith(4, '- \x1b[34m[dev]\x1b[0m module3 (\x1b[0m0.0.1 > 0.0.2\x1b[0m): http://module3.com');
});
