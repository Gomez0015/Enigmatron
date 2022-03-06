const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const activeInteractions = new Map();
const SQLite = require("better-sqlite3");
const sql = new SQLite("./db/users.sqlite");
require('dotenv').config();

bot.commands = new Collection();
const commandFiles = fs.readdirSync('./commands/').filter(f => f.endsWith('.js'))
for (const file of commandFiles) {
    const props = require(`./commands/${file}`)
    console.log(`${file} loaded`)
    bot.commands.set(props.info.name, props)
}


bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);

    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'users';").get();
    if (!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare("CREATE TABLE users (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER);").run();
        // Ensure that the "id" row is always unique and indexed.
        sql.prepare("CREATE UNIQUE INDEX idx_users_id ON users (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }

    // And then we have two prepared statements to get and set the users data.
    bot.getUser = sql.prepare("SELECT * FROM users WHERE user = ? AND guild = ?");
    bot.setUser = sql.prepare("INSERT OR REPLACE INTO users (id, user, guild, points) VALUES (@id, @user, @guild, @points);");
    bot.getTop10 = sql.prepare("SELECT * FROM users WHERE guild = ? ORDER BY points DESC LIMIT 10;");
});

bot.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        let commandfile = bot.commands.get(interaction.commandName);
        if (activeInteractions.get(interaction.user.id) === true) {
            interaction.reply({ content: 'You already have an active interaction!', ephemeral: true });
        } else {
            let user = bot.getUser.get(interaction.user.id, interaction.guild.id);

            if (!user) {
                user = {
                    id: `${interaction.guild.id}-${interaction.user.id}`,
                    user: interaction.user.id,
                    guild: interaction.guild.id,
                    points: 0,
                }
            }

            if (commandfile) commandfile.run(bot, user, interaction, activeInteractions);
        }
    }
});


bot.login(process.env.BOT_TOKEN);