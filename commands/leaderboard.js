const { MessageEmbed } = require('discord.js');

exports.run = async(bot, user, interaction) => {
    const top10 = bot.getTop10.all(interaction.guild.id);

    // Now shake it and show it! (as a nice embed, too!)
    const embed = new MessageEmbed()
        .setTitle("Leaderboard")
        .setAuthor({ name: bot.user.username, iconURL: bot.user.avatarURL() })
        .setDescription("Our top 10 enigma solvers!")
        .setColor('#000000');

    for (const data of top10) {
        embed.addField(bot.users.cache.get(data.user).tag, `${data.points} points`);
    }

    await interaction.reply({ embeds: [embed] });
}

exports.info = {
    name: "leaderboard",
    description: "Top 10 Heckers"
}