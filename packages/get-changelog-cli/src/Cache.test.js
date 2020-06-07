const fs = require('fs').promises;
const Cache = require('./Cache.js');

test('log warning (no cache file)', async () => {
    const logSpy = jest.spyOn(global.console, 'log');
    const cache = new Cache({ path: './mocks/notValid.json' });
    await cache.init();
    expect(logSpy).toBeCalled();
});

test('read existing cache data', async () => {
    const logSpy = jest.spyOn(global.console, 'log');
    const cache = new Cache({ path: './mocks/valid/testCache.json' });
    await cache.init();
    expect(logSpy).not.toBeCalled();
    expect(cache.data).toEqual({ express: 'https://github.com/expressjs/express/blob/master/History.md' });
});

test('get data from cache', async () => {
    const cache = new Cache({ path: './mocks/valid/testCache.json' });
    await cache.init();
    expect(await cache.get('express')).toEqual('https://github.com/expressjs/express/blob/master/History.md');
});

test('write data', async () => {
    const cache = new Cache({ path: './mocks/newCache.json' });
    await cache.init();
    await cache.set('moduleName', 'https://changelogUrl.com');
    await cache.write();
    const cacheFile = await fs.readFile('./mocks/newCache.json');
    expect(JSON.parse(cacheFile)).toEqual({ moduleName: 'https://changelogUrl.com' });
    await fs.unlink('./mocks/newCache.json');
});

test('log error when it is not possible to write cache file', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');
    const cache = new Cache({ path: './mocks/invalidPath/newCache.json' });
    await cache.init();
    await cache.set('moduleName', 'https://changelogUrl.com');
    await cache.write();
    expect(errorSpy).toBeCalledWith('Error writing cache file');
});
