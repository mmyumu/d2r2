/* eslint-disable no-inline-comments */
const { join } = require('path');
const stringSimilarity = require('string-similarity');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const discordUtils = require('./discordUtils');
const { commands } = require('../cached_commands');

module.exports = {
    buildCommand,
    execute,
    playSoundInVoiceChannel,
};

function buildCommand(commandName, description) {
    if (!description) {
        description = `Soundboard ${commandName}`;
    }

    return new SlashCommandBuilder()
        .setName(commandName)
        .setDescription(description)
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription(`Search for ${commandName} sounds with keywords`)
                .addStringOption(option => option.setName('keywords').setDescription('Keywords to find specific sound').setRequired(true))
                .addMentionableOption(option => option.setName('target').setDescription('Play the sound in the channel of target user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription(`Play ${commandName} sound`)
                .addStringOption(option => option.setName('keywords').setDescription('Keywords to find specific sound'))
                .addStringOption(option => option.setName('sound').setDescription('Choose specific sound'))
                .addMentionableOption(option => option.setName('target').setDescription('Play the sound in the channel of target user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription(`List ${commandName} sounds`));
}

async function execute(commandName, interaction, sounds, resourceDir) {
    if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.options.getSubcommand() === 'search') {
            await searchForSounds(commandName, sounds, interaction);
        } else if (interaction.options.getSubcommand() === 'play') {
            await playSound(sounds, interaction, resourceDir);
        } else if (interaction.options.getSubcommand() === 'list') {
            await listSounds(commandName, sounds, interaction);
        }
    } else if (interaction.isSelectMenu()) {
        await interaction.deferUpdate();
        const tokens = interaction.customId.split('|');

        let target = null;
        if (tokens.length > 1) {
            const interaction_command = commands[tokens[1]];
            target = interaction_command.options.getMentionable('target');
            delete commands[tokens[1]];
        }
        const member = discordUtils.getMember(interaction, target);

        await interaction.editReply({ content: 'Sound was selected', components: [] });
        const voiceChannel = member.voice.channel;
        playSoundInVoiceChannel(interaction, interaction.values[0], voiceChannel, resourceDir);
    }
}

async function searchForSounds(commandName, sounds, interaction) {
    const keywords = interaction.options.getString('keywords');
    const target = interaction.options.getMentionable('target');

    if (!keywords) {
        await interaction.editReply({ content: 'You must specify keywords', ephemeral: true });
        return;
    }

    const matches = stringSimilarity.findBestMatch(sanitizeTitle(keywords), getAllSoundsTitles(sounds));

    let foundSounds = [];
    for (const [index, r] of matches.ratings.entries()) {
        if (r.rating > 0) {
            sounds[index].rating = r.rating;
            foundSounds.push(sounds[index]);
        }
    }

    foundSounds = Object.values(foundSounds).map(value => value).sort((a, b) => b.rating - a.rating);

    if (foundSounds.length > 0) {
        foundSounds = foundSounds.slice(0, 5);
        const options = forgeOptions(foundSounds);

        let target_id_str = '';
        if (target) {
            const cmd_uuid = uuidv4();
            commands[cmd_uuid] = interaction;
            target_id_str = `|${cmd_uuid}`;
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(`${commandName}${target_id_str}`)
                    .setPlaceholder('Nothing selected')
                    .addOptions(options),
            );

        await interaction.editReply({ content: 'Sounds found', components: [row], ephemeral: true });
    } else {
        await interaction.editReply({ content: 'No sounds found matching keywords', ephemeral: true });
    }
}

function forgeOptions(sounds) {
    const options = [];
    for (const sound of sounds) {
        options.push({
            label: sound.title,
            value: sound.file,
        });
    }

    return options;
}

function createEmbed(commandName) {
    const title = `List of ${commandName} sounds`;
    const description = `You can use /${commandName} play sound:<sound name> with the following names`;

    return new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        // .setURL('https://discord.js.org/')
        // .setAuthor('Some name', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
        .setDescription(description);
}

async function listSounds(commandName, sounds, interaction) {
    const client = interaction.client;

    const user = client.users.cache.get(interaction.member.user.id);

    const listEmbeds = [];

    const sortedSounds = Object.values(sounds).map(value => value).sort((a, b) => a.file.localeCompare(b.file));

    let value = '';
    const fields = [];
    for (const index in sortedSounds) {
        const sound = sortedSounds[index];
        const soundName = sound.file.slice(0, sound.file.length - 4);
        if (value.length + ('\n' + soundName).length > 1024) {
            fields.push(value);
            value = '';
        }
        value += '\n' + soundName;
    }
    fields.push(value);

    let listEmbed = createEmbed(commandName);
    for (const index in fields) {
        const field = fields[index];

        if (listEmbed.length + field.length > 6000) {
            listEmbeds.push(listEmbed);
            listEmbed = createEmbed(commandName);
        }
        listEmbed.addField('Sound name', field, true);
    }
    listEmbeds.push(listEmbed);

    for (const index in listEmbeds) {
        const embed = listEmbeds[index];
        user.send({ embeds: [embed] }).catch(console.error);
    }

    await interaction.editReply({ content: 'List sent in private message', ephemeral: true });
}

async function playSound(sounds, interaction, resourceDir) {
    const keywords = interaction.options.getString('keywords');
    const sound = interaction.options.getString('sound');
    const target = interaction.options.getMentionable('target');

    const member = discordUtils.getMember(interaction, target);

    const soundName = getSoundName(sounds, sound, keywords);

    const voiceChannel = member.voice.channel;

    await playSoundInVoiceChannel(interaction, soundName, voiceChannel, resourceDir);
}

function getSoundName(sounds, sound, keywords) {
    let soundName = null;
    if (sound) {

        if (!sound.endsWith('.mp3')) {
            sound += '.mp3';
        }

        for (const d of Object.values(sounds)) {
            if (d.file === sound || d.title === sound) {
                soundName = d.file;
                break;
            }
        }
    } else if (keywords) {
        const matches = stringSimilarity.findBestMatch(sanitizeTitle(keywords), getAllSoundsTitles(sounds));
        soundName = sounds[matches.bestMatchIndex].file;
    }

    if (!soundName) {
        const index = Math.floor(Math.random() * sounds.length);
        soundName = sounds[index].file;
    }

    return soundName;
}

async function playSoundInVoiceChannel(interaction, soundName, voiceChannel, resourceDir) {
    if (!voiceChannel) {
        await interaction.editReply({ content: 'The target must be in a voice channel', ephemeral: true });
        return;
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    if (!soundName.endsWith('.mp3') && !soundName.endsWith('.WAV')) {
        soundName += '.mp3';
    }

    const mp3Path = join(__dirname, `../commands/${resourceDir}/${soundName}`);
    console.debug(`Playing ${soundName}`);
    const resource = createAudioResource(mp3Path, {
        metadata: {
            title: `Sound: ${soundName}`,
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

function getAllSoundsTitles(sounds) {
    const soundsTitles = [];
    for (const d of Object.values(sounds)) {
        soundsTitles.push(sanitizeTitle(d.title));
    }

    return soundsTitles;
}

function sanitizeTitle(title) {
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