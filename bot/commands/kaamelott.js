const resourceDir = '../resources/kaamelott';
const sounds = require(`${resourceDir}/sounds.json`);
const playSounds = require('../utils/playSounds');
const commandName = 'kaamelott';

module.exports = {
    data: playSounds.buildCommand(commandName, 'Soundboard of \'Kaamelott\''),
    execute(interaction) {
        playSounds.execute(commandName, interaction, sounds, resourceDir);
    },
};