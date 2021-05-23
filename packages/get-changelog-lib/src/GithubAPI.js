import got from 'got';

export default class GithubAPI {
    /**
     * @constructor
     * @param {String} repositoryUrl
     */
    constructor(repositoryUrl) {
        this.apiPath = repositoryUrl.replace(/https:\/\/(www\.)?github.com\//, 'https://api.github.com/repos/');
    }

    /**
     * Check if github api is activated (auth token provided)
     * @returns {Boolean} activation status
     */
    isActivated() {
        const oauthToken = process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN;
        return !!oauthToken && typeof oauthToken === 'string';
    }

    /**
     * Get default repository branch
     * @return {Promise<String>} default branch
     */
    async getDefaultBranch() {
        let branch;
        try {
            const requestOptions = {
                headers: {
                    Authorization: `token ${process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN}`,
                },
            };
            const apiResult = await got(this.apiPath, requestOptions).json();
            branch = apiResult.default_branch;
        } catch (error) {
            console.error(error);
        }
        return branch;
    }

    /**
     * Check if release is changelog
     * @returns {Promise<Boolean>} release is changelog
     */
    async isReleaseChangelog() {
        const releaseUrl = `${this.apiPath}/releases/latest`;

        let isReleaseChangelog = false;
        try {
            const requestOptions = {
                headers: {
                    Authorization: `token ${process.env.CHANGELOGFINDER_GITHUB_AUTH_TOKEN}`,
                },
            };
            const release = await got(releaseUrl, requestOptions).json();
            isReleaseChangelog = Boolean(release.body && release.body.length > 0);
        } catch (error) {
            if (error.response && error.response.statusCode !== 404) {
                console.error(error);
            }
        }
        return isReleaseChangelog;
    }
}
