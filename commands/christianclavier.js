const cheerio = require('cheerio');
const https = require('follow-redirects').https;
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('christianclavier')
		.setDescription('Generate synopsis of a movie with Christian Clavier'),
	async execute(interaction) {
		await interaction.deferReply();

        get_synopsis(async function(expr) {
            console.debug(`Return synopsis: ${expr}`);
            await interaction.editReply(expr);
        });
	},
};

function get_synopsis(callback) {
    const options = {
        hostname: 'depression.cool',
        port: 443,
        path: '/clavier/',
        method: 'GET',
		headers: { 'User-Agent': 'Mozilla/5.0' },
    };

    console.debug(`Get synopsis: ${options.hostname}:${options.port}/${options.path} (${options.method})`);

    const req = https.request(options, res => {
         console.debug(`statusCode: ${res.statusCode}`);

        let str = '';
        res.on('data', chunk => {
            str += chunk;
        });

        res.on('end', () => {
            const $ = cheerio.load(str);
            callback($('p').text());
        });

    });

    req.on('error', error => {
        console.error(error);
    });

    req.end();
}