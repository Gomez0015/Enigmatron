const { MessageActionRow, MessageButton } = require('discord.js');
const previousCrypto = new Map();

const cryptoChallenges = [{
        text: '01000110 01001100 01000001 01000111 01111011 00110011 01011010 01011111 01010000 00110011 00110100 01010011 01011001 01111101',
        hint: 'BEEP BOOP THIS IS MY LANGUAGE!',
        flag: 'FLAG{3Z_P34SY}',
    },
    {
        text: '1e14cf6ac08d886c0330ee19ee2c4bc3',
        hint: 'Maybe its some type of an MD hash?',
        flag: 'flag12345',
    },
    {
        text: 'SYNT{E0G_13}',
        hint: 'Maybe you need to rotate the letters in the alphabet',
        flag: 'FLAG{R0T_13}',
    },


];

exports.run = async(bot, user, interaction, activeInteractions) => {
    activeInteractions.set(interaction.user.id, true);
    let randomCrypto = cryptoChallenges[Math.floor(Math.random() * cryptoChallenges.length)];

    if (previousCrypto.get(interaction.user.id)) {
        if (previousCrypto.get(interaction.user.id).length >= cryptoChallenges.length) {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('reset')
                    .setLabel('GO AGANE')
                    .setStyle('PRIMARY'),
                    new MessageButton()
                    .setCustomId('cancel')
                    .setLabel('NO')
                    .setStyle('DANGER'),
                );

            await interaction.reply({ content: '`You have answered all of the stegno challenges!`', components: [row] });

            const filter = i => ['cancel', 'reset'].includes(i.customId) && i.user.id === interaction.user.id;

            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'reset') {
                    previousCrypto.set(interaction.user.id, []);
                    await i.update({ content: '`Reset Progress!`', components: [] });
                    activeInteractions.set(interaction.user.id, false);
                } else if (i.customId === 'cancel') {
                    previousCrypto.set(interaction.user.id, []);
                    await i.update({ content: '`See ya next time then!`', components: [] });
                    activeInteractions.set(interaction.user.id, false);
                }

                collector.stop();
            });

            return;
        } else {
            let match = previousCrypto.get(interaction.user.id).filter(function(item) { return item === randomCrypto; });
            while (match.length > 0) {
                randomCrypto = cryptoChallenges[Math.floor(Math.random() * cryptoChallenges.length)];
                match = previousCrypto.get(interaction.user.id).filter(function(item) { return item === randomCrypto; });
            }
        }
    } else {
        previousCrypto.set(interaction.user.id, []);
    }

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('hint')
            .setLabel('Hint')
            .setStyle('PRIMARY'),
        );

    await interaction.reply({
        content: '`' + randomCrypto.text + '`',
        components: [row]
    });

    let usedHint = false;

    let filter = i => i.customId === 'hint' && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({ filter });

    collector.on('collect', async i => {
        if (i.customId === 'hint') {
            await i.update({
                content: '`' + randomCrypto.text + '` \n' + randomCrypto.hint,
                components: [row],
            });
            usedHint = true;
        }
        collector.stop();
    });

    filter = m => (m.author.id === interaction.user.id);

    const messageCollector = interaction.channel.createMessageCollector({ filter });

    messageCollector.on('collect', m => {
        if (m.content == randomCrypto.flag) {
            let previousCryptoArray = previousCrypto.get(interaction.user.id);
            previousCryptoArray.push(randomCrypto)
            previousCrypto.set(interaction.user.id, previousCryptoArray);

            interaction.editReply({ content: '`Correct ✅`', components: [], files: [] });
            usedHint ? user.points += 1 : user.points += 2
            bot.setUser.run(user);
            activeInteractions.set(interaction.user.id, false);
            m.delete();
        } else {
            interaction.editReply({ content: '`Wrong ⛔`', components: [], files: [] });
            activeInteractions.set(interaction.user.id, false);
            m.delete();
        }
        messageCollector.stop();
        collector.stop();
    })
}

exports.info = {
    name: "cryptography",
    description: "Can you crack it?"
}