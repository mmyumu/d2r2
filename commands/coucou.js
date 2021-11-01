const fs = require('fs');
const { join } = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coucou')
		.setDescription('Coucou !'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
        const orig = join(__dirname, '../resources/coucou/orig/R2-D2.png');
        const dest = join(__dirname, '../resources/coucou/upload.png');

        fs.copyFileSync(orig, dest);
        const client = interaction.client;
        const user = client.users.cache.get(interaction.member.user.id);
        await user.send({
            files: ['./resources/coucou/upload.png'],
        });

        fs.unlinkSync(dest);

        await interaction.editReply({ content: 'Coucou sent in private message', ephemeral: true });
	},
};
