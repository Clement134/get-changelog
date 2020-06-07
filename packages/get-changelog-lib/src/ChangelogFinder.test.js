const registryUrl = require('registry-url');
const got = require('got');
const ChangelogFinder = require('./ChangelogFinder');

class ErrorHttp extends Error {
    constructor(statusCode) {
        super();
        this.response = { statusCode };
    }
}

jest.mock('registry-url');
jest.mock('got');

test('returns null if registry not found', async () => {
    registryUrl.mockReturnValue();
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('moduleName')).toBe(null);
});

test('returns null if module not found in registry', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation(() => ({
        json: jest.fn().mockResolvedValue({}),
    }));
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('moduleName')).toBe(null);
});

test('returns changelog url from cache', async () => {
    const cacheMock = {
        get: () => 'https://github.com/User/module-name/blob/master/CHANGELOG-from-cache.md',
    };
    const changelogFinder = new ChangelogFinder({}, cacheMock);
    expect(registryUrl).not.toBeCalled();
    expect(got).not.toBeCalled();
    expect(await changelogFinder.getChangelog('module-name')).toBe(
        'https://github.com/User/module-name/blob/master/CHANGELOG-from-cache.md'
    );
});

test('returns CHANGELOG.md url', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') return 'CHANGELOG DATA';
        return {
            json: jest.fn().mockResolvedValue({
                'dist-tags': {
                    latest: '1.0.0',
                },
                versions: {
                    '1.0.0': {
                        repository: {
                            type: 'git',
                            url: 'git+https://github.com/User/module-name.git',
                        },
                    },
                },
            }),
        };
    });
    const cacheSetSpy = jest.fn();
    const cacheMock = {
        get: () => {},
        set: cacheSetSpy,
    };
    const changelogFinder = new ChangelogFinder({}, cacheMock);
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/blob/master/CHANGELOG.md');
    expect(cacheSetSpy).toBeCalledWith('module-name', 'https://github.com/User/module-name/blob/master/CHANGELOG.md');
});

test('supports default branch when https://github.com', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation((url) => {
        if (url === 'https://api.github.com/repos/User/module-name')
            return {
                json: jest.fn().mockResolvedValue({ default_branch: 'develop' }),
            };
        if (url === 'https://github.com/User/module-name/blob/develop/CHANGELOG.md') return 'CHANGELOG DATA';
        return {
            json: jest.fn().mockResolvedValue({
                'dist-tags': {
                    latest: '1.0.0',
                },
                versions: {
                    '1.0.0': {
                        repository: {
                            type: 'git',
                            url: 'git+https://github.com/User/module-name.git',
                        },
                    },
                },
            }),
        };
    });
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/blob/develop/CHANGELOG.md');
});

test('use master branch when github api is not available', async () => {
    const errorSpy = jest.spyOn(global.console, 'error');
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation((url) => {
        if (url === 'https://api.github.com/repos/User/module-name') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') return 'CHANGELOG DATA';
        return {
            json: jest.fn().mockResolvedValue({
                'dist-tags': {
                    latest: '1.0.0',
                },
                versions: {
                    '1.0.0': {
                        repository: {
                            type: 'git',
                            url: 'git+https://www.github.com/User/module-name.git',
                        },
                    },
                },
            }),
        };
    });
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://www.github.com/User/module-name/blob/master/CHANGELOG.md');
    expect(errorSpy).toBeCalled();
});

test('use github token to get default branch', async () => {
    process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN = 'githubToken';
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    const gotMock = got.mockImplementation((url) => {
        if (url === 'https://api.github.com/repos/User/module-name')
            return {
                json: jest.fn().mockResolvedValue({
                    default_branch: 'develop',
                }),
            };
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') return 'CHANGELOG DATA';
        return {
            json: jest.fn().mockResolvedValue({
                'dist-tags': {
                    latest: '1.0.0',
                },
                versions: {
                    '1.0.0': {
                        repository: {
                            type: 'git',
                            url: 'git+https://github.com/User/module-name.git',
                        },
                    },
                },
            }),
        };
    });
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/blob/develop/CHANGELOG.md');
    expect(gotMock).nthCalledWith(2, 'https://api.github.com/repos/User/module-name', { headers: { Authorization: 'token githubToken' } });
    delete process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN;
});

test('returns History.md url', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/changelog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/ChangeLog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/History.md') return 'CHANGELOG DATA';

        return {
            json: jest.fn().mockResolvedValue({
                'dist-tags': {
                    latest: '1.0.0',
                },
                versions: {
                    '1.0.0': {
                        repository: {
                            type: 'git',
                            url: 'git+https://github.com/User/module-name.git',
                        },
                    },
                },
            }),
        };
    });
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/blob/master/History.md');
});

test('returns github releases', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/changelog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/ChangeLog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/History.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/HISTORY.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/CHANGES.md') throw new ErrorHttp(500);
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.txt') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/changelog.txt') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/ChangeLog.txt') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/History.txt') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/HISTORY.txt') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/CHANGES.txt') throw new ErrorHttp(500);

        return {
            json: jest.fn().mockResolvedValue({
                'dist-tags': {
                    latest: '1.0.0',
                },
                versions: {
                    '1.0.0': {
                        repository: {
                            type: 'git',
                            url: 'git+https://github.com/User/module-name.git',
                        },
                    },
                },
            }),
        };
    });
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/releases');
});

test('returns changelog on bitbucket', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/src/master/CHANGELOG.md') return 'CHANGELOG DATA';

        return {
            json: jest.fn().mockResolvedValue({
                'dist-tags': {
                    latest: '1.0.0',
                },
                versions: {
                    '1.0.0': {
                        repository: {
                            type: 'git',
                            url: 'git+https://bitbucket.org/User/module-name.git',
                        },
                    },
                },
            }),
        };
    });
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://bitbucket.org/User/module-name/src/master/CHANGELOG.md');
});

test('returns changelog on custom repository', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation((url) => {
        if (url === 'https://private-repo2.com/User/module-name/browse/CHANGELOG.md') return 'CHANGELOG DATA';

        return {
            json: jest.fn().mockResolvedValue({
                'dist-tags': {
                    latest: '1.0.0',
                },
                versions: {
                    '1.0.0': {
                        repository: {
                            type: 'git',
                            url: 'git+https://private-repo2.com/User/module-name.git',
                        },
                    },
                },
            }),
        };
    });
    const changelogFinder = new ChangelogFinder({
        customRepositories: {
            'private-repo1': 'src',
            'private-repo2': 'browse',
        },
    });
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://private-repo2.com/User/module-name/browse/master/CHANGELOG.md');
});
