const cheerio = require('cheerio');
const http = require('follow-redirects').http;
const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('omg')
		.setDescription('Generate an expression so you can "exprimer ton étonnement partout sur le net"'),
	async execute(interaction) {
        await interaction.deferReply();

        getExpression(async function(expr) {
            console.debug(`Return expression: ${expr}`);
            await interaction.editReply(expr);
        });
	},
};

function getExpression(callback) {
    const options = {
        hostname: 'nioutaik.fr',
        port: 80,
        path: '/Expressionotron',
        method: 'GET',
    };

    console.debug(`Get omg expression: ${options.hostname}:${options.port}/${options.path} (${options.method})`);

    const req = http.request(options, res => {
        res.setEncoding('latin1');
        console.debug(`statusCode: ${res.statusCode}`);

        let str = '';
        res.on('data', chunk => {
            str += chunk;
        });

        res.on('end', () => {
            const $ = cheerio.load(str);
            callback($('strong', 'font').text());
        });

    });

    req.on('error', error => {
        console.error(error);
    });

    req.end();
}