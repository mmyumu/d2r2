const fs = require('fs');
const http = require('../utils/http.js');
const zonesonsJSON = require('./zonesons_tiny2.json');


async function parseMovie(movieJSON) {
    for (const i in movieJSON.sounds) {
        const sound = movieJSON.sounds[i];
        const url = `https://${zonesonsJSON.host}/${sound.file}`;
        const tokens = sound.file.split('/');
        const sound_file_name = tokens[tokens.length - 1];

        console.log(`Downloading ${url}`);
        await http.downloadFile(zonesonsJSON.host, sound.file, `./download/${sound_file_name}`);
    }
}

async function parseMovies(json) {
    for (const movie of json.movies) {
        if ('sounds' in movie) {
            const newQuotes = await parseMovie(movie);
            movie['sounds'] = newQuotes;
        } else {
            console.log(`Skip ${movie.path}`);
        }

    }
}

(async () => {
    const dir = './download';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    await parseMovies(zonesonsJSON);
})();