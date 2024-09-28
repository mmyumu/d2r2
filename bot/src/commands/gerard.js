const resourceDir = '../resources/gerard';
const sounds = require(`${resourceDir}/gerard.json`).sounds;
const playSounds = require('../utils/playSounds');
const commandName = 'gerard';

module.exports = {
    data: playSounds.buildCommand(commandName, 'Soundboard of \'Gérard\''),
    execute(interaction) {
        playSounds.execute(commandName, interaction, sounds, resourceDir);
    },
};