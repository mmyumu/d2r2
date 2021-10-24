/* eslint-disable no-inline-comments */
const { join } = require('path');
const stringSimilarity = require('string-similarity');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('kaamelott')
        .setDescription('Kaamelott soundboard')
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for Kaamelott sounds with keywords')
                .addStringOption(option => option.setName('keywords').setDescription('Keywords to find specific sound'))
                .addMentionableOption(option => option.setName('target').setDescription('Play the sound in the channel of target user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play Kaamelott sound')
                .addStringOption(option => option.setName('keywords').setDescription('Keywords to find specific sound'))
                .addStringOption(option => option.setName('sound').setDescription('Choose specific sound'))
                .addMentionableOption(option => option.setName('target').setDescription('Play the sound in the channel of target user'))),
    async execute(interaction) {
        if (interaction.isCommand()) {
            await interaction.deferReply({ ephemeral: true });
            const dataFile = getDataFile();

            if (interaction.options.getSubcommand() === 'search') {
                await searchForSounds(dataFile, interaction);
            } else if (interaction.options.getSubcommand() === 'play') {
                await playSound(dataFile, interaction);
            }
        } else if (interaction.isSelectMenu()) {
            const tokens = interaction.customId.split('|');

            let member = null;
            if (tokens.length > 1) {
                member = interaction.guild.members.cache.get(tokens[1]);
            } else {
                member = interaction.guild.members.cache.get(interaction.member.user.id);
            }

            await interaction.update({ content: 'Sound was selected', components: [] });
            const voiceChannel = member.voice.channel;
            playSoundInVoiceChannel(interaction, interaction.values[0], voiceChannel);
        }
    },
};

function getDataFile() {
    const sounds_json_path = join(__dirname, '/resources/kaamelott/sounds.json');
    return require(sounds_json_path);
}

async function searchForSounds(dataFile, interaction) {
    const keywords = interaction.options.getString('keywords');
    const target = interaction.options.getMentionable('target');

    if (!keywords) {
        await interaction.editReply({ content: 'You must specify keywords', ephemeral: true });
        return ;
    }

    const matches = stringSimilarity.findBestMatch(sanitize_title(keywords), get_all_sounds_titles(dataFile));

    let found_sounds = [];
    for (const [index, r] of matches.ratings.entries()) {
        if (r.rating > 0) {
            dataFile[index].rating = r.rating;
            found_sounds.push(dataFile[index]);
        }
    }

    found_sounds = Object.values(found_sounds).map(value => value).sort((a, b) => b.rating - a.rating);

    if (found_sounds.length > 0) {
        found_sounds = found_sounds.slice(0, 5);
        const options = forge_options(found_sounds);

        let target_id_str = '';
        if (target) {
            target_id_str = `|${target.id}`;
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(`kaamelott${target_id_str}`)
                    .setPlaceholder('Nothing selected')
                    .addOptions(options),
            );

        await interaction.editReply({ content: 'Kaamelott sounds found', components: [row], ephemeral: true });
    } else {
        await interaction.editReply({ content: 'No Kaamelott sounds found matching keywords', ephemeral: true });
    }
}

function forge_options(sounds) {
    const options = [];
    for (const sound of sounds) {
        options.push({
            label: sound.title,
            value: sound.file,
        });
    }

    return options;
}

async function playSound(dataFile, interaction) {
    const keywords = interaction.options.getString('keywords');
    const sound = interaction.options.getString('sound');
    const target = interaction.options.getMentionable('target');

    const member = getMember(interaction, target);

    const soundName = getSoundName(dataFile, sound, keywords);

    const voiceChannel = member.voice.channel;

    await playSoundInVoiceChannel(interaction, soundName, voiceChannel);
}

function getMember(interaction, target) {
    if (target) {
        return target;
    } else {
        return interaction.guild.members.cache.get(interaction.member.user.id);
    }
}

function getSoundName(dataFile, sound, keywords) {
    let sound_name = null;
    if (sound) {

        if (!sound.endsWith('.mp3')) {
            sound += '.mp3';
        }

        for (const d of Object.values(dataFile)) {
            if (d.file === sound || d.title === sound) {
                sound_name = d.file;
                break;
            }
        }
    } else if (keywords) {
        const matches = stringSimilarity.findBestMatch(sanitize_title(keywords), get_all_sounds_titles(dataFile));
        sound_name = dataFile[matches.bestMatchIndex].file;
    }

    if (!sound_name) {
        const index = Math.floor(Math.random() * dataFile.length);
        sound_name = dataFile[index].file;
    }

    return sound_name;
}

async function playSoundInVoiceChannel(interaction, soundName, voiceChannel) {
    if (!voiceChannel) {
        await interaction.editReply({ content: 'You must be in a voice channel', ephemeral: true });
        return;
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    if (!soundName.endsWith('.mp3')) {
        soundName += '.mp3';
    }

    const mp3_path = join(__dirname, `/resources/kaamelott/${soundName}`);
    console.debug(`Playing ${soundName}`);
    const resource = createAudioResource(mp3_path, {
        metadata: {
            title: `Kaamelott sound: ${soundName}`,
        },
    });

    const player = createAudioPlayer();

    player.on('error', error => {
        console.error('Error:', error.message, 'with track', error.resource.metadata.title);
    });
    player.on(AudioPlayerStatus.Idle, async () => {
        await interaction.editReply({ content: `Played ${soundName}`, ephemeral: true });
    });

    player.play(resource);

    await interaction.editReply({ content: `Playing ${soundName}...`, ephemeral: true });
    connection.subscribe(player);
}

function get_all_sounds_titles(dataFile) {
    const sounds = [];
    for (const d of Object.values(dataFile)) {
        sounds.push(sanitize_title(d.title));
    }

    return sounds;
}

function sanitize_title(title) {
    const accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    const noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

    for (let i = 0; i < accent.length; i++) {
        title = title.replace(accent[i], noaccent[i]);
    }

    return title;
}