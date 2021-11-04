const { SlashCommandBuilder } = require('@discordjs/builders');
const playSounds = require('../utils/playSounds');
const discordUtils = require('../utils/discordUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('beep')
		.setDescription('Beep boop')
        .addMentionableOption(option => option.setName('target').setDescription('Play the sound in the channel of target user')),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

        const target = interaction.options.getMentionable('target');
        const member = discordUtils.getMember(interaction, target);
        const voiceChannel = member.voice.channel;

        const index = Math.floor(Math.random() * 9) + 1;

        const soundName = `R2 ${index}.WAV`;

        playSounds.playSoundInVoiceChannel(interaction, soundName, voiceChannel, '../resources/r2d2');
	},
};
