const fs = require('fs');
const http = require('../utils/http.js');
const ouicheJSON = require('./ouiche.json');

function downloadQuotesFromPage($) {
    const results = $('a.tag').map((i, a) => {
        const href = $(a).attr('href');
        const tokens = href.split('/');
        const name = tokens [tokens.length - 1];
        const path = `/mp3/${name}.mp3`;

        http.downloadFile(ouicheJSON.host, path, `./download/ouiche/${name}.mp3`);

        return {
            'title': name,
            'file':  `${name}.mp3`,
        };
    }).toArray();

    return results;
}

async function parse() {
    const dir = './download/ouiche';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const $ = await http.getPage(ouicheJSON.host, '');
    const quotes = await downloadQuotesFromPage($);
    ouicheJSON.sounds = quotes;

    return ouicheJSON;
}

(async () => {
    const json = await parse();

    const jsonContent = JSON.stringify(json, null, 4);
    fs.writeFile('./ouiches.json', jsonContent, 'utf8', function (err) {
        if (err) {
            console.log('An error occured while writing JSON Object to File.');
            return console.log(err);
        }

        console.log('JSON file has been saved.');
    });
})();