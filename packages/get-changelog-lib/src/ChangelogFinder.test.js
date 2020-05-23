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
    const changelogFinder = new ChangelogFinder();
    expect(await changelogFinder.getChangelog('module-name')).toBe('https://github.com/User/module-name/blob/master/CHANGELOG.md');
});

test('supports default branch', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation((url) => {
        if (url === 'https://api.github.com/repos/User/module-name') return {
            json: jest.fn().mockResolvedValue({
                default_branch: "develop"
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
});

test('returns History.md url', async () => {
    registryUrl.mockReturnValue('https://registry.npmjs.org/');
    got.mockImplementation((url) => {
        if (url === 'https://github.com/User/module-name/blob/master/CHANGELOG.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/changelog.md') throw new ErrorHttp(404);
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
        if (url === 'https://github.com/User/module-name/blob/master/History.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/HISTORY.md') throw new ErrorHttp(404);
        if (url === 'https://github.com/User/module-name/blob/master/CHANGES.md') throw new ErrorHttp(500);

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
