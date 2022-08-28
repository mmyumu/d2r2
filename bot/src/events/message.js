module.exports = {
    name: 'messageCreate',
    execute(client, message) {
        if (message.author.bot) return false;

        if (message.mentions.has(client.user)) {
            message.channel.send('your message');
        }
        return 'ok';
    },
};