const { MessageActionRow, MessageButton } = require('discord.js');
const previousStegno = new Map();

const stegnoChallenges = [{
        name: 'Stegno_1.jpg',
        file: './commands/images/stegno1.jpg',
        hint: 'Try looking for the images hidden information',
        flag: 'FLAG{G00DJ0B_H4CK3R}',
    },
    {
        name: 'Stegno_2.wav',
        file: './commands/images/stegno2.wav',
        hint: 'Maybe theres some hidden spectral energies?',
        flag: 'FLAG{SP3CTR4L_4UD10}',
    },
    {
        name: 'Stegno_3.jpg',
        file: './commands/images/stegno5.jpg',
        hint: 'https://stegonline.georgeom.net/',
        flag: 'FLAG{C0L0R}',
    }


];

exports.run = async(bot, user, interaction, activeInteractions) => {
    activeInteractions.set(interaction.user.id, true);
    let randomStegno = stegnoChallenges[Math.floor(Math.random() * stegnoChallenges.length)];

    if (previousStegno.get(interaction.user.id)) {
        if (previousStegno.get(interaction.user.id).length >= stegnoChallenges.length) {
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
                    previousStegno.set(interaction.user.id, []);
                    await i.update({ content: '`Reset Progress!`', components: [] });
                    activeInteractions.set(interaction.user.id, false);
                } else if (i.customId === 'cancel') {
                    previousStegno.set(interaction.user.id, []);
                    await i.update({ content: '`See ya next time then!`', components: [] });
                    activeInteractions.set(interaction.user.id, false);
                }

                collector.stop();
            });

            return;
        } else {
            let match = previousStegno.get(interaction.user.id).filter(function(item) { return item === randomStegno; });
            while (match.length > 0) {
                randomStegno = stegnoChallenges[Math.floor(Math.random() * stegnoChallenges.length)];
                match = previousStegno.get(interaction.user.id).filter(function(item) { return item === randomStegno; });
            }
        }
    } else {
        previousStegno.set(interaction.user.id, []);
    }


    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('hint')
            .setLabel('Hint')
            .setStyle('PRIMARY'),
        );

    await interaction.reply({
        files: [{
            attachment: randomStegno.file,
            name: randomStegno.name
        }],
        components: [row]
    });

    let usedHint = false;

    let filter = i => i.customId === 'hint' && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({ filter });

    collector.on('collect', async i => {
        if (i.customId === 'hint') {
            await i.update({
                files: [{
                    attachment: randomStegno.file,
                    name: randomStegno.name
                }],
                components: [row],
                content: `${randomStegno.hint}`,
            });
            usedHint = true
        }
        collector.stop();
    });

    filter = m => (m.author.id === interaction.user.id);

    const messageCollector = interaction.channel.createMessageCollector({ filter });

    messageCollector.on('collect', m => {
        if (m.content == randomStegno.flag) {
            let previousStegnoArray = previousStegno.get(interaction.user.id);
            previousStegnoArray.push(randomStegno)
            previousStegno.set(interaction.user.id, previousStegnoArray);

            interaction.editReply({ content: '`Correct ✅`', components: [], files: [] });
            usedHint ? user.points += 2 : user.points += 4
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
    name: "stegno",
    description: "Can you find the flag?"
}