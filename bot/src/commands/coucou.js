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
        const user = client.users.cache.get(interaction.user.id);

        try {
            removeFile(dest);
            await interaction.editReply({ content: 'I am trying to say hello but it might take some time...please be patient', components: [] });
            await http.downloadFile(cfg.host, cfg.path, dest, cfg.port);

            await user.send({
                files: [dest],
            });
            removeFile(dest);
        } catch (error) {
            await user.send('Sorry I am not ready to say hello');
        }
        await interaction.editReply({ content: 'Coucou sent in private message', ephemeral: true });
	},
};

function removeFile(dest) {
    if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
    }
}