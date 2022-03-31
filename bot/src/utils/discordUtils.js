module.exports = {
    getMember,
};

function getMember(interaction, target) {
    if (target && target.voice) {
        return target;
    } else if (interaction.guild) {
        return interaction.guild.members.cache.get(interaction.member.user.id);
    } else {
        for (const guild of interaction.client.guilds.cache.map(g => g)) {
            for (const member of guild.members.cache.map(m => m)) {
                if (member.id === interaction.user.id) {
                    return member;
                }
            }
        }
    }
    throw 'Member not found';
}