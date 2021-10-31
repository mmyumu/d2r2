const fs = require('fs');
const http = require('../utils/http.js');
const zonesonsJSON = require('./zonesons.json');

function forgePagePath(path, page) {
    return `${path}/page-${page}`;
}

function getMaxPage($) {
    const pageText = $('#nav1 p:first').text();
    const re = /^Page\s*\d*\s*sur\s*(?<maxPage>\d*)$/;
    const match = re.exec(pageText);

    return parseInt(match.groups.maxPage);
}

function getQuotesFromPage($) {
    const results = $('div.art-post-inner').map((i, div) => {
        const title = $(div).find('h2.art-postheader a.PostHeader');
        const audio = $(div).find('audio');

        if (title.length > 0 && audio.length > 0) {
            return {
                title: title.text(),
                file: audio.attr('src'),
            };
        }
    }).toArray();

    return results;
}

async function parsePage(path, page) {
    const pagePath = forgePagePath(path, page);
    console.log(`${pagePath}`);

    const $ = await http.getPage(zonesonsJSON.host, pagePath);
    return getQuotesFromPage($);
}

async function parseMoviePage(moviePagePath) {
    const $ = await http.getPage(zonesonsJSON.host, moviePagePath);
    const maxPage = getMaxPage($);
    console.log(`Number of pages found: ${maxPage}`);

    let quotes = [];
    quotes = [].concat(quotes, getQuotesFromPage($));

    for (let i = 2; i <= maxPage; i++) {
        const pageQuotes = await parsePage(moviePagePath, i);
        quotes = [].concat(quotes, pageQuotes);
    }
    return quotes;
}

async function parseMovies(json) {
    for (const movie of json.movies) {
        if (!('sounds' in movie)) {
            const newQuotes = await parseMoviePage(movie.path);
            movie['sounds'] = newQuotes;
        } else {
            console.log(`Skip ${movie.path}`);
        }

    }
    return json;
}

(async () => {
    const json = await parseMovies(zonesonsJSON);

    const jsonContent = JSON.stringify(json, null, 4);
    fs.writeFile('./zonesons.json', jsonContent, 'utf8', function (err) {
        if (err) {
            console.log('An error occured while writing JSON Object to File.');
            return console.log(err);
        }

        console.log('JSON file has been saved.');
    });
})();