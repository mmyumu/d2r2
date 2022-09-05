const http = require('../utils/http.js');
const crypto = require('crypto');

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        if (message.author.bot) return false;

        if (message.mentions.has(client.user)) {
            const cfg = require('../config.json')['chatbot'];

            var hash = crypto.createHash('md5').update(cfg.password).digest('hex');

            const data= {
                password: hash,
                user: message.author.username,
                sentence: get_sentence(client, message)
            }

            const result = await http.post(cfg.host, cfg.path, cfg.port, false, data);

            message.channel.send(result);
        }
        return 'ok';
    },
};

function get_sentence(client, message) {
    return message.content.replace("<@" + client.user.id + ">", "").trim();
}