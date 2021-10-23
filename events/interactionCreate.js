module.exports = {
    name: 'interactionCreate',
    execute(interaction) {
        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        // if (!interaction.isCommand() && !interaction.isSelectMenu()) return;

        let commandId = null;
        if (interaction.isCommand()) {
            commandId = interaction.commandName;
        } else if (interaction.isSelectMenu()) {
            const customId = interaction.customId.split('|')[0];
            commandId = customId;
        }

        if (!commandId) return;

        const client = interaction.client;
        const command = client.commands.get(commandId);

        if (!command) return;

        try {
            command.execute(interaction);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};