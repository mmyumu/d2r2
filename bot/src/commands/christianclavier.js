const http = require('../utils/http.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('christianclavier')
		.setDescription('Generate synopsis of a movie with Christian Clavier'),
	async execute(interaction) {
		await interaction.deferReply();

        const synopsis = await getSynopsis();
        console.debug(`Return synopsis: ${synopsis}`);
        await interaction.editReply(synopsis);
	},
    getSynopsis,
};

async function getSynopsis() {
    const $ = await http.getPage('depression.cool', '/clavier/', 443);
    return $('p').text();
}