import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE_LOCATION = `${__dirname}/../cache.json`;

export default class Cache {
    /**
     * @constructor
     * @param {Object} [options] optional options
     * @param {String} [options.path] location of cache file
     */
    constructor(options = {}) {
        this.data = {};
        this.path = options.path || CACHE_FILE_LOCATION;
    }

    /**
     * Init cache by reading existing cache data
     */
    async init() {
        try {
            const cacheFile = await fs.readFile(this.path);
            this.data = JSON.parse(cacheFile);
        } catch (err) {
            console.log('No valid cache file');
        }
    }

    /**
     * Write memory cache data to file
     */
    async write() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.data));
        } catch (err) {
            console.error('Error writing cache file');
        }
    }

    /**
     * Search data in cache
     * @param {String} key key to search in cache
     */
    get(key) {
        return this.data[key];
    }

    /**
     * Set data in cache
     * @param {String} key key of the data
     * @param {String} value data to store
     */
    set(key, value) {
        this.data[key] = value;
    }
}
