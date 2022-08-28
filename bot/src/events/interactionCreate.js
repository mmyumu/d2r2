module.exports = {
    name: 'interactionCreate',
    execute(client, interaction) {
        if (!interaction.channel || interaction.channel.type === 'DM') {
            console.log(`${interaction.user.tag} in DM triggered an interaction: ${interaction.commandName}`);
        } else {
            console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: ${interaction.commandName}`);
        }

        // if (!interaction.isCommand() && !interaction.isSelectMenu()) return;

        let commandId = null;
        if (interaction.isCommand()) {
            commandId = interaction.commandName;
        } else if (interaction.isSelectMenu()) {
            const customId = interaction.customId.split('|')[0];
            commandId = customId;
        }

        if (!commandId) return;

        const user_client = interaction.client;
        const command = user_client.commands.get(commandId);

        if (!command) return;

        try {
            command.execute(interaction);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};