const fs = require('fs');
const http = require('../utils/http.js');
const { join } = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('coucou')
		.setDescription('Coucou !'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

        delete require.cache[require.resolve('../config.json')];
        const cfg = require('../config.json')['coucou'];
        const dest = join(__dirname, '../resources/coucou/upload.png');

        const client = interaction.client;
        const user = client.users.cache.get(interaction.member.user.id);

        try {
            await http.downloadFile(cfg.host, cfg.path, dest, cfg.port);
            fs.unlinkSync(dest);

            await user.send({
                files: [dest],
            });
        } catch (error) {
            await user.send('Désolé, je ne suis pas prêt pour vous faire un petit coucou');
        }
        await interaction.editReply({ content: 'Coucou sent in private message', ephemeral: true });
	},
};
