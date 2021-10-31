const cheerio = require('cheerio');
const https = require('follow-redirects').https;
const fs = require('fs');

function forgeOptions(hostname, path) {
    return {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' },
    };
}

function getPage(hostname, path) {
    const options = {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            console.debug(`statusCode: ${res.statusCode}`);

            let str = '';
            res.on('data', chunk => {
                str += chunk;
            });

            res.on('end', () => {
                const $ = cheerio.load(str);
                resolve($);
            });

        });

        req.on('error', error => {
            console.error(error);
            reject(error);
        });

        req.end();
    });
}

function downloadFile(hostname, path, output) {
    const options = forgeOptions(hostname, path);

    if (fs.existsSync(output)) {
        console.log(`Skip file ${output}`);
        return;
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            console.debug(`statusCode: ${res.statusCode} for ${hostname}/${path}`);
            const file = fs.createWriteStream(output);
            res.pipe(file);

            res.on('end', () => {
                resolve();
            });
        });


        req.on('error', error => {
            console.error(error);
            reject(error);
        });

        req.end();
    });
}

module.exports = {
    getPage,
    downloadFile,
};