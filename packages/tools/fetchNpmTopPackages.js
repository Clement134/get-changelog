const got = require('got');
const ChangelogFinder = require('get-changelog-lib');
const changeLogFinder = new ChangelogFinder();

const SEARCH_URL = 'http://registry.npmjs.org/-/v1/search?text=boost-exact:true&popularity=1.0&quality=0.0&maintenance=0.0&size=100&from=1';

(async () => {
    const { objects } = await got.get(SEARCH_URL).json();
    for (let i = 0; i < objects.length; i++) {
        const { package } = objects[i];
        const changelogUrl = await changeLogFinder.getChangelog(package.name, package.version);
        console.log(`${package.name},${package.version},${changelogUrl}`);
    }
})();
