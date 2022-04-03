const http = require('../utils/http.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('christianclavier')
		.setDescription('Generate synopsis of a movie with Christian Clavier'),
	async execute(interaction) {
		await interaction.deferReply();

        getSynopsis(async function(expr) {
            console.debug(`Return synopsis: ${expr}`);
            await interaction.editReply(expr);
        });
	},
    getSynopsis,
};

async function getSynopsis() {
    const $ = await http.getPage('depression.cool', '/clavier/', 443);
    return $('p').text();
}