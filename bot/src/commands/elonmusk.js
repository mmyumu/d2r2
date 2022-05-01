const resourceDir = '../resources/elonmusk/';
const resCompanies = require(`${resourceDir}/companies.json`);
const resActions = require(`${resourceDir}/actions.json`);
const resObjects = require(`${resourceDir}/objects.json`);
const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { registerFont, createCanvas, loadImage } = require('canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('elonmusk')
		.setDescription('Elon Musk wants to buy something'),
	async execute(interaction) {
		await interaction.deferReply();

        let attachment = null;

        const line = buildLine(resCompanies, resActions, resObjects, Math.random() < 0.5);
        attachment = await buildAttachment(line);

        if (attachment) {
            interaction.editReply({ files: [attachment] });
        } else {
            interaction.editReply({ content: 'Cannot generate message', ephemeral: true });
        }
	},
    buildLine,
};

function buildLine(companies, actions, objects, goodAction) {
    const company = companies[Math.floor(Math.random() * companies.length)];

    let actionsByTag = null;
    let objectsByTag = null;
    if (goodAction) {
        actionsByTag = getElementsFromTag(actions, 'good');
        objectsByTag = getElementsFromTag(objects, 'bad');
    } else {
        actionsByTag = getElementsFromTag(actions, 'bad');
        objectsByTag = getElementsFromTag(objects, 'good');
    }

    const action = actionsByTag[Math.floor(Math.random() * actionsByTag.length)];
    const object = objectsByTag[Math.floor(Math.random() * objectsByTag.length)];

    return `Next I'm buying ${company} to ${action} ${object}`;
}

function getElementsFromTag(elements, tags) {
    if (typeof tags === 'string' || tags instanceof String) {
        tags = [tags];
    }

    const elementsFromTag = [];

    for (const element in elements) {
        for (const tag in tags) {
            if (elements[element]['tags'].includes(tags[tag])) {
                elementsFromTag.push(element);
            }
        }
    }

    return elementsFromTag;
}

async function buildAttachment(line) {
    const canvas = await buildCanvas(line);

    // Use the helpful Attachment class structure to process the file for you
    const attachment = new MessageAttachment(canvas.toBuffer(), 'elonmusk.png');

    return attachment;
}

async function buildCanvas(line) {
    registerFont('./resources/elonmusk/twitterchirp.ttf', { family: 'TwitterChirp' });

    const canvas = createCanvas(596, 204);
    const context = canvas.getContext('2d');

    const background = await loadImage('./resources/elonmusk/background.png');

    // This uses the canvas dimensions to stretch the image onto the entire canvas
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    let fontSize = 23;
    if (line.length > 50) {
        fontSize = 20;
    }

    // Select the font size and type from one of the natively available fonts
    context.font = `${fontSize}px TwitterChirp, FreeSans`;

    // Select the style that will be used to fill the text in
    context.fillStyle = '#152025';

    // Actually fill the text with a solid color
    context.fillText(line, 16, 100);

    return canvas;
}