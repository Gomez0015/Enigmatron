const { MessageActionRow, MessageButton } = require('discord.js');
const previousRiddles = new Map();

const riddles = [{
        q: 'The less you have, the more one is valuable. What is it?',
        o: ['Friends', 'Birds', 'Diamonds'],
        a: 'Friends'
    },
    {
        q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
        o: ['Water', 'Wind', 'Echo'],
        a: 'Echo'
    },
    {
        q: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
        o: ['Earth', 'Map', 'Greenland'],
        a: 'Map'
    },
    {
        q: 'What disappears as soon as you say its name?',
        o: ['Air', 'A Trick', 'Silence'],
        a: 'Silence'
    },
    {
        q: `Three identical-looking umbrellas are sitting upright in a stand. Assuming the owners don't check their umbrellas' labels, what percentage chance is there that only two people will walk off with their own umbrella?`,
        o: ['0%', '33%', '16%'],
        a: '0%'
    }
];

exports.run = async(bot, user, interaction, activeInteractions) => {
    activeInteractions.set(interaction.user.id, true);
    const row = new MessageActionRow();
    let randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];


    if (previousRiddles.get(interaction.user.id)) {
        if (previousRiddles.get(interaction.user.id).length >= riddles.length) {
            row.addComponents(
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
                    previousRiddles.set(interaction.user.id, []);
                    await i.update({ content: '`Reset Progress!`', components: [] });
                    activeInteractions.set(interaction.user.id, false);
                } else if (i.customId === 'cancel') {
                    previousRiddles.set(interaction.user.id, []);
                    await i.update({ content: '`See ya next time then!`', components: [] });
                    activeInteractions.set(interaction.user.id, false);
                }

                collector.stop();
            });

            return;
        } else {
            let match = previousRiddles.get(interaction.user.id).filter(function(riddle) { return riddle === randomRiddle; });
            while (match.length > 0) {
                randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
                match = previousRiddles.get(interaction.user.id).filter(function(riddle) { return riddle === randomRiddle; });
            }
        }
    } else {
        previousRiddles.set(interaction.user.id, []);
    }

    randomRiddle.o.forEach((option) => {
        row.addComponents(
            new MessageButton()
            .setCustomId(option)
            .setLabel(option)
            .setStyle('PRIMARY'),
        );
    });

    await interaction.reply({ content: '`' + randomRiddle.q + '`', components: [row] });

    const filter = i => randomRiddle.o.includes(i.customId) && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {

        if (i.customId === randomRiddle.a) {
            let previousRiddleArray = previousRiddles.get(interaction.user.id);
            previousRiddleArray.push(randomRiddle)

            previousRiddles.set(interaction.user.id, previousRiddleArray);

            await i.update({ content: '`Correct ✅`', components: [] });
            user.points++;
            bot.setUser.run(user);
            activeInteractions.set(interaction.user.id, false);
        } else {
            await i.update({ content: '`Wrong ⛔`', components: [] });
            activeInteractions.set(interaction.user.id, false);
        }
        collector.stop();
    });
}

exports.info = {
    name: "riddle",
    description: "Can you solve it?"
}