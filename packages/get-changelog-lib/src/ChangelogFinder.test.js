/* eslint-disable consistent-return */
const registryUrl = require('registry-url');
const got = require('got');
const GithubAPI = require('./GithubAPI');
const ChangelogFinder = require('./ChangelogFinder');

class ErrorHttp extends Error {
    constructor(statusCode) {
        super();
        this.response = { statusCode };
    }
}

jest.mock('registry-url');
jest.mock('got');
jest.mock('./GithubAPI');

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

test('returns specific changelog url', async () => {
    const changelogFinder = new ChangelogFinder({});
    expect(registryUrl).not.toBeCalled();
    expect(got).not.toBeCalled();
    expect(await changelogFinder.getChangelog('lodash')).toBe('https://github.com/lodash/lodash/wiki/Changelog');
});

test('returns CHANGELOG.md url', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') return { statusCode: 200 };
    });
    got.mockImplementation(() => ({
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
    }));
    const cacheSetSpy = jest.fn();
    const cacheMock = {
        get: () => {},
        set: cacheSetSpy,
    };
    const changelogFinder = new ChangelogFinder({}, cacheMock);
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/blob/master/CHANGELOG.md');
    expect(cacheSetSpy).toBeCalledWith('module-name', 'https://github.com/User/module-name/blob/master/CHANGELOG.md');
});

test('use default branch for github (if token provided)', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/develop/CHANGELOG.md') return { statusCode: 200 };
    });
    got.mockImplementation(() => ({
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
    }));
    GithubAPI.mockImplementation(() => ({
        isActivated: jest.fn().mockReturnValue(true),
        getDefaultBranch: jest.fn().mockResolvedValue('develop'),
    }));
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/blob/develop/CHANGELOG.md');
});

test('use master branch when github api is not available (if token provided)', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        console.log(url);
        if (url === 'https://www.github.com/User/module-name/blob/master/CHANGELOG.md') return { statusCode: 200 };
    });
    got.mockImplementation(() => ({
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
    }));
    GithubAPI.mockImplementation(() => ({
        isActivated: jest.fn().mockReturnValue(true),
        getDefaultBranch: jest.fn().mockResolvedValue(null),
    }));
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://www.github.com/User/module-name/blob/master/CHANGELOG.md');
});

test('returns History.md url', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/changelog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/ChangeLog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/History.md') return { statusCode: 200 };
    });
    got.mockImplementation(() => ({
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
    }));
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/blob/master/History.md');
});

test('returns CHANGELOG.txt url (if --txt option set)', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/changelog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/ChangeLog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/History.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.txt') return { statusCode: 200 };
    });
    got.mockImplementation(() => ({
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
    }));
    const changelogFinder = new ChangelogFinder({ exploreTxtFiles: true });
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/blob/master/CHANGELOG.txt');
});

test('return null when release is not changelog (if token provided)', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/changelog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/ChangeLog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/History.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/HISTORY.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/CHANGES.md') throw new ErrorHttp(500);
    });
    got.mockImplementation(() => ({
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
    }));
    GithubAPI.mockImplementation(() => ({
        isActivated: jest.fn().mockReturnValue(true),
        getDefaultBranch: jest.fn().mockResolvedValue(null),
        isReleaseChangelog: jest.fn().mockResolvedValue(false),
    }));
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe(null);
});

test('returns github releases', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/changelog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/ChangeLog.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/History.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/HISTORY.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/CHANGES.md') throw new ErrorHttp(500);
    });
    got.mockImplementation(() => ({
        json: jest.fn().mockResolvedValue({
            'dist-tags': {
                latest: '1.0.0',
            },
            body: 'test',
            versions: {
                '1.0.0': {
                    repository: {
                        type: 'git',
                        url: 'git+https://github.com/User/module-name.git',
                    },
                },
            },
        }),
    }));
    GithubAPI.mockImplementation(() => ({
        isActivated: jest.fn().mockReturnValue(false),
    }));
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/releases');
});

test('returns changelog on bitbucket', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        if (url === 'https://bitbucket.org/User/module-name/src/master/CHANGELOG.md') return { statusCode: 200 };
    });
    got.mockImplementation(() => ({
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
    }));
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://bitbucket.org/User/module-name/src/master/CHANGELOG.md');
});

test('returns changelog on gitlab', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        if (url === 'https://gitlab.com/User/module-name/-/blob/master/CHANGELOG.md') return { statusCode: 302 };
        if (url === 'https://gitlab.com/User/module-name/-/blob/master/changelog.md') return { statusCode: 200 };
    });
    got.mockImplementation(() => ({
        json: jest.fn().mockResolvedValue({
            'dist-tags': {
                latest: '1.0.0',
            },
            versions: {
                '1.0.0': {
                    repository: {
                        type: 'git',
                        url: 'git+https://gitlab.com/User/module-name.git',
                    },
                },
            },
        }),
    }));
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://gitlab.com/User/module-name/-/blob/master/changelog.md');
});

test('returns changelog on custom repository', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.head = jest.fn().mockImplementation((url) => {
        if (url === 'https://private-repo2.com/User/module-name/browse/master/CHANGELOG.md') return { statusCode: 200 };
    });
    got.mockImplementation(() => ({
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
    }));
    const changelogFinder = new ChangelogFinder({
        customRepositories: {
            'private-repo1': 'src',
            'private-repo2': 'browse',
        },
    });
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://private-repo2.com/User/module-name/browse/master/CHANGELOG.md');
});
