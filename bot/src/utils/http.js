const cheerio = require('cheerio');
const fr = require('follow-redirects');
const fs = require('fs');

function forgeOptions(hostname, port, path, method, data) {
    delete require.cache[require.resolve('../config.json')];
    const cfg = require('../config.json');

    if (method === undefined) {
        method = 'GET';
    }

    let headers = {};
    if (data !== undefined) {
        headers = {
            'User-Agent': 'Mozilla/5.0',
            // 'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Type': 'application/json'
            // 'Content-Length': data.length
        }
    } else {
        headers = {
            'User-Agent': 'Mozilla/5.0'
        }
    }

    return {
        hostname: hostname,
        port: port,
        path: path,
        method: method,
        headers: headers,
        timeout: cfg.timeout,
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
    const result = await get(hostname, path, port, https);
    return JSON.parse(result);
}

async function getPage(hostname, path, port, https) {
    const result = await get(hostname, path, port, https);
    return cheerio.load(result);
}

function get(hostname, path, port, https) {
    const options = forgeOptions(hostname, port, path, 'GET');
    return request(port, https, options);
}

function post(hostname, path, port, https, data) {
    const data_str = JSON.stringify(data);

    const options = forgeOptions(hostname, port, path, 'POST', data_str);
    return request(port, https, options, data_str);
}

function request(port, https, options, data) {
    const m = getModule(port, https);

    return new Promise((resolve, reject) => {
        const req = m.request(options, res => {
            console.debug(`Requesting ${JSON.stringify(options)}, statusCode: ${res.statusCode}`);

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

        if (data !== undefined) {
            req.write(data);
        }
        req.end();
    });
} 

function downloadFile(hostname, path, output, port, https) {
    const options = forgeOptions(hostname, port, path, 'GET');

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

        // use its "timeout" event to abort the request
        req.on('timeout', () => {
            console.error('Request timeout');
            reject();
        });

        req.on('error', error => {
            console.error(error);
            reject(error);
        });

        req.end();
    });
}

module.exports = {
    get,
    getPage,
    getJSON,
    downloadFile,
    post,
};