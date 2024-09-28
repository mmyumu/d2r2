const fs = require('fs');
const { Client, Collection, GatewayIntentBits, ReactionUserManager } = require('discord.js');
require('log-timestamp');


if (process.argv.length !== 3) {
	console.error('Bad usage')
	return
}

const config_json_path = process.argv[2]
const { token } = require('./' + config_json_path);

console.log(`Running bot with configuration: ${config_json_path}`)

const client = new Client({ fetchAllMembers: true, intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(client, ...args));
	} else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
}

client.login(token);