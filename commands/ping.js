exports.run = async(bot, user, interaction) => {
    await interaction.reply("My ping is \`" + bot.ws.ping + " ms\`");
}

exports.info = {
    name: "ping",
    description: "Replies with pong!"
}