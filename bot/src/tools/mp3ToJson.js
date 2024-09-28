const path = require("path");
const fs   = require("fs");
const basePath = 'resources/gerard';

function throughDirectory(directory) {
    let files = []
    fs.readdirSync(directory).forEach(File => {
        const absolute = path.join(directory, File);
        if (fs.statSync(absolute).isDirectory()) {
            const result = throughDirectory(absolute);
            if (result !== undefined) {
                files.push(...result);
            }
        } else {
            if (absolute.endsWith("mp3")) {
                return files.push(absolute);
            }
        }
    });
    return files;
}

const mp3s = throughDirectory("./resources/gerard");

const json = {
    sounds: []
}

for (const mp3 of mp3s) {
    const relativePath = mp3.replace(basePath + '/', '');
    let title = path.basename(relativePath);
    title = title.slice(0, -4)
    
    json.sounds.push({
        "title": title,
        "file": relativePath
    });
}

(async () => {
    const jsonContent = JSON.stringify(json, null, 4);
    fs.writeFile('./gerard.json', jsonContent, 'utf8', function (err) {
        if (err) {
            console.log('An error occured while writing JSON Object to File.');
            return console.log(err);
        }

        console.log('JSON file has been saved.');
    });
})();