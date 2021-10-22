const { join } = require('path');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('kaamelott')
        .setDescription('Play Kaamelott sound'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const client = interaction.client;
        const guild = client.guilds.cache.get(interaction.guildId);
        const member = guild.members.cache.get(interaction.member.user.id);
        const voiceChannel = member.voice.channel;

        if (voiceChannel) {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            const mp3_path = join(__dirname, '/resources/vous_etes_un_gros_nul.mp3');
            console.debug(`Playing ${mp3_path}`);
            const resource = createAudioResource(mp3_path, {
                metadata: {
                    title: 'A good song!',
                },
            });

            const player = createAudioPlayer();

            player.on('error', error => {
                console.error('Error:', error.message, 'with track', error.resource.metadata.title);
            });
            player.on(AudioPlayerStatus.Idle, async () => {
                await interaction.editReply({ content: `Played ${mp3_path}`, ephemeral: true });
            });

            player.play(resource);

            await interaction.editReply({ content: `Playing ${mp3_path}...`, ephemeral: true });
            connection.subscribe(player);
        } else {
            await interaction.editReply({ content: 'You must be in a voice channel', ephemeral: true });
        }
    },
};