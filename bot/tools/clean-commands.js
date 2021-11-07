const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('../config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`..docker run --restart=unless-stopped --name=d2r2 -d d2r2:0.2.0docker run --restart=unless-stopped --name=d2r2 -d d2r2:0.2.0/commands/${file}`);
	console.log(`Command ${command.data.name} is being unregistered in guild ${guildId}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);
rest.get(Routes.applicationGuildCommands(clientId, guildId))
    .then(data => {
        const promises = [];
        for (const command of data) {
            const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`;
            promises.push(rest.delete(deleteUrl));
        }
        return Promise.all(promises);
    })
    .then(rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands }));