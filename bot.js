const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const fetch = require('node-fetch');
const { REST } = require('@discordjs/rest');

const token = 'TWÓJ_BOT_TOKEN';           // Podmień na token swojego bota
const clientId = 'TWÓJ_CLIENT_ID';         // Podmień na client ID aplikacji bota
const guildId = 'ID_SERWERA_GDZIE_TESTUJESZ';  // Podmień na ID serwera do testów
const fluxpointToken = 'TWÓJ_FLUXPOINT_API_TOKEN'; // Token API z https://fluxpoint.dev

const categories = [
  'Anal',
  'Ass',
  'Bdsm',
  'Blowjob',
  'Boobjob',
  'Boobs',
  'Cum',
  'Feet',
  'Futa',
  'Handjob'
];

// Definicja komendy slash
const commands = [
  new SlashCommandBuilder()
    .setName('genshininpact')
    .setDescription('Wysyła losowy NSFW gif z kategorii anime')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Wybierz kategorię')
        .setRequired(true)
        .addChoices(
          categories.map(cat => ({ name: cat, value: cat }))
        )
    )
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(token);

// Rejestracja komendy na serwerze (guild)
(async () => {
  try {
    console.log('Rejestracja komend...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('Komendy zarejestrowane!');
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'genshininpact') {
    const category = interaction.options.getString('category');
    const url = `https://api.fluxpoint.dev/nsfw/gif/${category.toLowerCase()}`;

    await interaction.deferReply();

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: fluxpointToken
        }
      });

      if (!response.ok) throw new Error('Błąd podczas pobierania z API');

      const data = await response.json();

      if (!data.url) {
        await interaction.editReply('Nie znaleziono obrazka dla tej kategorii.');
        return;
      }

      await interaction.editReply({ content: `Losowy gif z kategorii **${category}**:`, files: [data.url] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('Wystąpił błąd podczas pobierania obrazka.');
    }
  }
});

client.login(token);
