const resourceDir = '../resources/tfbh';
const resTemplates = require(`${resourceDir}/modeles.json`);
const resConjunctions = require(`${resourceDir}/conjonctions.json`);
const resWords = require(`${resourceDir}/mots.json`);
const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { registerFont, createCanvas, loadImage } = require('canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tfbh')
		.setDescription('Try finger but hole')
        .addSubcommand(subcommand =>
            subcommand
                .setName('random')
                .setDescription('Create a random message')
                .addIntegerOption(option => option.setName('lines').setDescription('Number of lines').addChoice('1', 1).addChoice('2', 2)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('custom')
                .setDescription('Create a custom message')),
	async execute(interaction) {
		await interaction.deferReply();

        if (interaction.options.getSubcommand() === 'random') {
            let attachment = null;

            let lines_count = interaction.options.getInteger('lines');

            if (!lines_count) {
                lines_count = Math.floor(Math.random() * 2) + 1;
            }

            if (lines_count == 1) {
                const lines = buildLines(resWords, resTemplates, resConjunctions);
                attachment = await buildAttachment(lines[0]);
            } else if (lines_count == 2) {
                const lines = buildLines(resWords, resTemplates, resConjunctions, true);
                attachment = await buildAttachment(lines[0], lines[1]);
            }

            if (attachment) {
                interaction.editReply({ files: [attachment] });
            } else {
                interaction.editReply({ content: 'Cannot generate message', ephemeral: true });
            }
        } else if (interaction.options.getSubcommand() === 'custom') {
            interaction.editReply({ content: 'Not implemented yet', ephemeral: true });
        } else {
            interaction.editReply({ content: 'Invalid request', ephemeral: true });
        }
	},
    buildLines,
};

function flattenWords(words) {
    const flattenedWords = [];
    for (const category in words) {
        for (const wordIdx in words[category]) {
            flattenedWords.push(words[category][wordIdx]);
        }
    }
    return flattenedWords;
}

function buildLines(words, templates, conjunctions, use_conjunction = false) {
    const flattenedWords = flattenWords(words);

    const lines = [];

    if (use_conjunction) {
        const conjunction = conjunctions[Math.floor(Math.random() * conjunctions.length)];
        const word1 = flattenedWords[Math.floor(Math.random() * flattenedWords.length)];
        const word2 = flattenedWords[Math.floor(Math.random() * flattenedWords.length)];

        const template1 = templates[Math.floor(Math.random() * templates.length)];
        const template2 = templates[Math.floor(Math.random() * templates.length)];

        let line1 = template1.replace('****', word1);
        let line2 = template2.replace('****', word2);

        if (conjunction['line'] == 1) {
            line1 = line1 + conjunction['text'];
        } else if (conjunction['line'] == 2) {
            line2 = conjunction['text'] + ' ' + line2;
        }

        lines.push(line1);
        lines.push(line2);
    } else {
        const word1 = flattenedWords[Math.floor(Math.random() * flattenedWords.length)];
        const template1 = templates[Math.floor(Math.random() * templates.length)];

        const line1 = template1.replace('****', word1);
        lines.push(line1);
    }

    return lines;
}

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