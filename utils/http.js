const cheerio = require('cheerio');
const fr = require('follow-redirects');
const fs = require('fs');

function forgeOptions(hostname, port, path) {
    return {
        hostname: hostname,
        port: port,
        path: path,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' },
    };
}

function getModule(port, https) {
    let m = fr.http;
    if (https === true) {
        m = fr.https;
    } else if (port === 443) {
        m = fr.https;
    }

    return m;
}

async function getJSON(hostname, path, port, https) {
    const result = await getRaw(hostname, path, port, https);
    return JSON.parse(result);
}

async function getPage(hostname, path, port, https) {
    const result = await getRaw(hostname, path, port, https);
    return cheerio.load(result);
}

function getRaw(hostname, path, port, https) {
    const options = forgeOptions(hostname, port, path);

    const m = getModule(port, https);

    return new Promise((resolve, reject) => {
        const req = m.request(options, res => {
            console.debug(`statusCode: ${res.statusCode}`);

            let str = '';
            res.on('data', chunk => {
                str += chunk;
            });

            res.on('end', () => {
                resolve(str);
            });

        });

        req.on('error', error => {
            console.error(error);
            reject(error);
        });

        req.end();
    });
}

function downloadFile(hostname, path, output, port, https) {
    const options = forgeOptions(hostname, port, path);

    const m = getModule(port, https);

    if (fs.existsSync(output)) {
        console.log(`Skip file ${output}`);
        return;
    }

    return new Promise((resolve, reject) => {
        const req = m.request(options, res => {
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
    getJSON,
    downloadFile,
};