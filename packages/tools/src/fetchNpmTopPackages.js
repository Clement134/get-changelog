const { createWriteStream } = require('fs');
const path = require('path');

const got = require('got');
const ChangelogFinder = require('get-changelog-lib');

const changeLogFinder = new ChangelogFinder();

const MAX_SIZE = 100;
async function* getData(wantedItems) {
    let size = Math.min(wantedItems, MAX_SIZE);
    let index = 0;
    while (index < wantedItems) {
        const SEARCH_URL = `http://registry.npmjs.org/-/v1/search?text=boost-exact:true&popularity=1.0&quality=0.0&maintenance=0.0&size=${size}&from=${index + 1}`;
        console.log(SEARCH_URL);
        const { objects = [] } = await got.get(SEARCH_URL).json();
        yield* objects;
        index += size;
        size = Math.min(MAX_SIZE, wantedItems - index);
    }
}

(async () => {
    const timestamp = Date.now();
    const filePath = path.resolve(__dirname, `../data/data-${timestamp}`);
    const writeStream = createWriteStream(filePath);

    const nbPackages = process.argv[2] || 1000;

    // eslint-disable-next-line no-restricted-syntax
    for await (const { package: packageData } of getData(nbPackages)) {
        const changelogUrl = await changeLogFinder.getChangelog(packageData.name, packageData.version);
        const moduleData = {
            name: packageData.name,
            version: packageData.version,
            lastPublish: packageData.date,
            resolved: changelogUrl,
            file: changelogUrl ? path.basename(changelogUrl) : '?',
        };

        writeStream.write(`${JSON.stringify(moduleData)}\n`);
    }

    console.log(`file ${filePath} generated`);
})();
