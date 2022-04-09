const { MessageAttachment, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { registerFont, createCanvas, loadImage } = require('canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tfbh')
		.setDescription('Try finger but hole')
        .addSubcommand(subcommand =>
            subcommand
                .setName('1')
                .setDescription('Create a one line message')
                .addStringOption(option => option.setName('keywords').setDescription('Keywords to find specific expression').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('2')
                .setDescription('Create a two lines message')
                .addStringOption(option => option.setName('keywords1').setDescription('Keywords to find specific expression for line 1').setRequired(true))
                .addStringOption(option => option.setName('keywords2').setDescription('Keywords to find specific expression for line 2').setRequired(true))),
	async execute(interaction) {
		await interaction.deferReply();

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('select')
                    .setPlaceholder('Nothing selected')
                    .setMinValues(2)
                    .setMaxValues(3)
                    .addOptions([
                        {
                            label: 'Select me',
                            description: 'This is a description',
                            value: 'first_option',
                        },
                        {
                            label: 'You can select me too',
                            description: 'This is also a description',
                            value: 'second_option',
                        },
                        {
                            label: 'I am also an option',
                            description: 'This is a description as well',
                            value: 'third_option',
                        },
                    ]),
            )
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('select')
                    .setPlaceholder('Nothing selected2')
                    .setMinValues(2)
                    .setMaxValues(3)
                    .addOptions([
                        {
                            label: 'Select me',
                            description: 'This is a description',
                            value: 'first_option',
                        },
                        {
                            label: 'You can select me too',
                            description: 'This is also a description',
                            value: 'second_option',
                        },
                        {
                            label: 'I am also an option',
                            description: 'This is a description as well',
                            value: 'third_option',
                        },
                    ]),
            );
        await interaction.editReply({ content: 'Pong!', components: [row] });

        // const attachment = await buildAttachment('foule droit devant');
        // const attachment = await buildAttachment('Ahh, je n\'y crois pas... en vue..,', 'déjà vu quelque part......');
        // const embed = await buildEmbed('Ahh, je n\'y crois pas... en vue..,', 'déjà vu quelque part......');

        // interaction.editReply({ files: [attachment] });
	},
};

async function buildAttachment(line1, line2 = false) {
    const canvas = await buildCanvas(line1, line2);

    // Use the helpful Attachment class structure to process the file for you
    const attachment = new MessageAttachment(canvas.toBuffer(), 'tfbh.png');

    return attachment;
}

async function buildCanvas(line1, line2 = false) {
    registerFont('./resources/tfbh/GaramondPremrPro.otf', { family: 'Garamond Premier' });

    // Create a 700x250 pixel canvas and get its context
    // The context will be used to modify the canvas
    // const canvas = createCanvas(824, 200);
    const canvas = createCanvas(1030, 250);
    // const canvas = createCanvas(1030, 500);
    const context = canvas.getContext('2d');

    const background = await loadImage('./resources/tfbh/msg_background.png');
    // const background = await Canvas.loadImage('./commands/msg_background.png');

    // This uses the canvas dimensions to stretch the image onto the entire canvas
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    context.strokeRect(0, 0, canvas.width, canvas.height);

    // Select the font size and type from one of the natively available fonts
    context.font = '32px Garamond Premier';

    // Select the style that will be used to fill the text in
    context.fillStyle = '#a8a8a7';

    const evaluations = Math.floor(Math.random() * 100);

    const x = 175;
    let y = 95;
    if (line2) {
        y = 75;
    }

    // Actually fill the text with a solid color
    context.fillText(line1, x, y);

    if (line2) {
        context.fillText(line2, x, 127);
    }

    context.fillText(evaluations, 945, 175);

    return canvas;
}