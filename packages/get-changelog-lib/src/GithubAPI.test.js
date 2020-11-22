const got = require('got');
const GithubAPI = require('./GithubAPI');

jest.mock('got');

class ErrorHttp extends Error {
    constructor(statusCode) {
        super();
        this.response = { statusCode };
    }
}

test('return false if CHANGELOGFINDER_GITHUB_AUTH_TOKEN not provided', () => {
    const githubAPI = new GithubAPI('https://www.github.com/User/module-name');
    expect(githubAPI.isActivated()).toEqual(false);
});

test('return true if CHANGELOGFINDER_GITHUB_AUTH_TOKEN provided', () => {
    process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN = 'githubToken';
    const githubAPI = new GithubAPI('https://www.github.com/User/module-name');
    expect(githubAPI.isActivated()).toEqual(true);
    delete process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN;
});

test('return default branch', async () => {
    process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN = 'githubToken';
    got.mockImplementation(() => ({
        json: jest.fn().mockResolvedValue({ default_branch: 'develop' }),
    }));
    const githubAPI = new GithubAPI('https://www.github.com/User/module-name');
    expect(await githubAPI.getDefaultBranch()).toEqual('develop');
    expect(got).toHaveBeenCalledWith('https://api.github.com/repos/User/module-name', { headers: { Authorization: 'token githubToken' } });
    delete process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN;
});

test('return undefined if http error', async () => {
    process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN = 'githubToken';
    const errorSpy = jest.spyOn(global.console, 'error');
    got.mockImplementation(() => {
        throw new ErrorHttp(403);
    });
    const githubAPI = new GithubAPI('https://www.github.com/User/module-name');
    expect(await githubAPI.getDefaultBranch()).toBeUndefined();
    expect(got).toHaveBeenCalledWith('https://api.github.com/repos/User/module-name', { headers: { Authorization: 'token githubToken' } });
    expect(errorSpy).toBeCalled();
    delete process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN;
});

test('return true if releases are used has a changelog', async () => {
    process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN = 'githubToken';
    got.mockImplementation(() => ({
        json: jest.fn().mockResolvedValue({ body: '# V1.0.0' }),
    }));
    const githubAPI = new GithubAPI('https://www.github.com/User/module-name');
    expect(await githubAPI.isReleaseChangelog()).toEqual(true);
    expect(got).toHaveBeenCalledWith('https://api.github.com/repos/User/module-name/releases/latest', {
        headers: { Authorization: 'token githubToken' },
    });
    delete process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN;
});

test("return false if releases aren't used has a changelog", async () => {
    process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN = 'githubToken';
    got.mockImplementation(() => ({
        json: jest.fn().mockResolvedValue({ body: '' }),
    }));
    const githubAPI = new GithubAPI('https://www.github.com/User/module-name');
    expect(await githubAPI.isReleaseChangelog()).toEqual(false);
    expect(got).toHaveBeenCalledWith('https://api.github.com/repos/User/module-name/releases/latest', {
        headers: { Authorization: 'token githubToken' },
    });
    delete process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN;
});

test('return false on error', async () => {
    process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN = 'githubToken';
    const errorSpy = jest.spyOn(global.console, 'error');
    got.mockImplementation(() => {
        throw new ErrorHttp(403);
    });
    const githubAPI = new GithubAPI('https://www.github.com/User/module-name');
    expect(await githubAPI.isReleaseChangelog()).toEqual(false);
    expect(errorSpy).toBeCalled();
    expect(got).toHaveBeenCalledWith('https://api.github.com/repos/User/module-name/releases/latest', {
        headers: { Authorization: 'token githubToken' },
    });
    delete process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN;
});
