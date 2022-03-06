const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');

// Place your client and guild ids here
const clientId = '949762520028155955';
const token = 'OTQ5NzYyNTIwMDI4MTU1OTU1.YiPFRg.3Gd0MXcvx3cpfkPovSNgTq3WeW0';

const commands = [
        new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
        new SlashCommandBuilder().setName('riddle').setDescription('Can you solve it?'),
        new SlashCommandBuilder().setName('stegno').setDescription('Can you find the flag?'),
        new SlashCommandBuilder().setName('cryptography').setDescription('Can you crack it?'),
        new SlashCommandBuilder().setName('leaderboard').setDescription('Top 10 Heckers'),
    ]
    .map(command => command.toJSON());
const rest = new REST({ version: '9' }).setToken(token);

(async() => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, '857332849119723520'), { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();