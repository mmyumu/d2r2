const fs = require('fs');
const http = require('../utils/http.js');
const { join } = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
const cfg = require('./coucou.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('coucou')
		.setDescription('Coucou !'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

        const dest = join(__dirname, '../resources/coucou/upload.png');

        // const coucouJSON = await http.getJSON(cfg.host, cfg.path, cfg.port);
        await http.downloadFile(cfg.host, cfg.path, dest, cfg.port);
        const client = interaction.client;
        const user = client.users.cache.get(interaction.member.user.id);
        await user.send({
            files: [dest],
        });

        fs.unlinkSync(dest);

        await interaction.editReply({ content: 'Coucou sent in private message', ephemeral: true });
	},
};
