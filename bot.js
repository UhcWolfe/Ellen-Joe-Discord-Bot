const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const fetch = require('node-fetch');
const { REST } = require('@discordjs/rest');

const token = 'TWÓJ_BOT_TOKEN';
const clientId = 'TWÓJ_CLIENT_ID';
const guildId = 'ID_SERWERA';
const fluxpointToken = 'FP-O8xgMv7TL9NqMu4eRGovXhfbFW';

const categories = [
  'anal','ass','bdsm','blowjob','boobs','cum','feet','futa','handjob'
];

// Rejestracja komend
const commands = [
  new SlashCommandBuilder()
    .setName('genshininpact')
    .setDescription('Losowe NSFW anime (image)')
    .addStringOption(opt =>
      opt.setName('category')
        .setDescription('Wybierz kategorię')
        .setRequired(true)
        .addChoices(categories.map(c=>({ name:c, value:c })))
    ),
  new SlashCommandBuilder()
    .setName('hentai')
    .setDescription('Losowy NSFW hentai gif')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log('Komendy zarejestrowane!');
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once('ready', () => console.log(`Zalogowano jako ${client.user.tag}`));

client.on('interactionCreate', async inter => {
  if (!inter.isCommand()) return;

  if (inter.commandName === 'genshininpact') {
    const cat = inter.options.getString('category');
    const url = `https://api.fluxpoint.dev/nsfw/img/${cat}`;
    await sendImage(inter, url, cat);
  }

  if (inter.commandName === 'hentai') {
    const url = `https://api.fluxpoint.dev/nsfw/gif/hentai`;
    await sendGif(inter, url, 'hentai');
  }
});

async function sendImage(inter, url, category) {
  await inter.deferReply();
  try {
    const res = await fetch(url, { headers:{ Authorization: fluxpointToken } });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    if (!data.file) throw new Error('Brak data.file');

    await inter.editReply({
      embeds: [{
        title: `Kategoria: ${category}`,
        image: { url: data.file },
        footer: { text: "Powered by FluxpointAPI" },
        color: 0xFF00FF
      }]
    });
  } catch (err) {
    console.error(err);
    await inter.editReply('Nie udało się pobrać obrazka.');
  }
}

async function sendGif(inter, url, category) {
  await inter.deferReply();
  try {
    const res = await fetch(url, { headers:{ Authorization: fluxpointToken } });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    if (!data.file) throw new Error('Brak data.file');

    await inter.editReply({
      embeds: [{
        title: `Kategoria: ${category}`,
        image: { url: data.file },
        footer: { text: "Powered by FluxpointAPI" },
        color: 0xFF00FF
      }]
    });
  } catch (err) {
    console.error(err);
    await inter.editReply('Nie udało się pobrać gifa.');
  }
}

client.login(token);
