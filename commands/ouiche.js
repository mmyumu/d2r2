const resourceDir = '../resources/ouiche';
const sounds = require(`${resourceDir}/ouiche.json`).sounds;
const playSounds = require('../utils/playSounds');
const commandName = 'ouiche';

module.exports = {
    data: playSounds.buildCommand(commandName, 'Soundboard of \'la classe américaine\''),
    execute(interaction) {
        playSounds.execute(commandName, interaction, sounds, resourceDir);
    },
};