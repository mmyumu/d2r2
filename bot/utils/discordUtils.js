module.exports = {
    getMember,
};

function getMember(interaction, target) {
    if (target) {
        return target;
    } else {
        return interaction.guild.members.cache.get(interaction.member.user.id);
    }
}