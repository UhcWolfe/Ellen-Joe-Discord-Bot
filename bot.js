const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const fetch = require('node-fetch');
const { REST } = require('@discordjs/rest');

const token = 'TWÓJ_DISCORD_BOT_TOKEN';
const clientId = 'TWÓJ_CLIENT_ID';
const guildId = 'TWÓJ_GUILD_ID';
const fluxpointToken = 'FP-O8xgMv7TL9NqMu4eRGovXhfbFW';

const categories = [
  'anal','anus','ass','azurlane','bdsm','blowjob','boobs','cosplay','cum','feet',
  'femdom','futa','gasm','holo','kitsune','lewd','neko','nekopara','pantyhose',
  'peeing','petplay','pussy','slimes','solo','swimsuit','tentacle','thighs','trap','yaoi','yuri'
];

// 🔹 Tablica linków do zdjęć League of Legends
const lolImages = [
  "https://i.imgur.com/wMf67FH.jpeg",
  "https://i.imgur.com/zdexM9q.png",
  "https://i.imgur.com/su4X4ah.jpeg",
  "https://i.imgur.com/RyvwdvT.jpeg",
  "https://i.imgur.com/OeKSc4N.jpeg",
  "https://i.imgur.com/cpUR7Ee.jpeg",
  "https://i.imgur.com/iUKNq44.jpeg",
  "https://i.imgur.com/6jAKX45.png",
  "https://i.imgur.com/h9iQcuR.jpeg",
  "https://i.imgur.com/jpG3L8S.jpeg",
  "https://i.imgur.com/WDF6wVo.jpeg",
  "https://i.imgur.com/xAcUjIs.jpeg",
  "https://i.imgur.com/sj1CtdD.jpeg",
  "https://i.imgur.com/c5Gdcjl.jpeg",
  "https://i.imgur.com/QJkDSrm.jpeg",
  "https://i.imgur.com/mmBBI4q.jpeg",
  "https://i.imgur.com/iLzUauY.jpeg",
  "https://i.imgur.com/KtKeRij.jpeg",
  "https://i.imgur.com/7Z1gJeq.jpeg",
  "https://i.imgur.com/k6Kmd84.png",
  "https://i.imgur.com/mcoOS9B.jpeg"
];

// 🔹 Tablica linków do zdjęć Zenless Zone Zero
const zzzImages = [
  "https://i.imgur.com/EXAMPLE1.jpeg",
  "https://i.imgur.com/EXAMPLE2.png",
  "https://i.imgur.com/EXAMPLE3.jpeg"
  // dodaj więcej linków
];

// 🔹 Rejestracja komend
const commands = [
  new SlashCommandBuilder()
    .setName('genshininpact')
    .setDescription('Losowe NSFW anime (image)')
    .addStringOption(opt =>
      opt.setName('category')
         .setDescription('Wybierz kategorię')
         .setRequired(true)
         .setAutocomplete(true)
    ),
  new SlashCommandBuilder()
    .setName('hentai')
    .setDescription('Losowy NSFW hentai gif'),
  new SlashCommandBuilder()
    .setName('leagueoflegends')
    .setDescription('Losowy obrazek League of Legends'),
  new SlashCommandBuilder()
    .setName('zenlesszonezero')
    .setDescription('Losowy obrazek Zenless Zone Zero')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log('Komendy zarejestrowane!');
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => console.log(`Zalogowano jako ${client.user.tag}`));

client.on('interactionCreate', async inter => {
  if (inter.isAutocomplete()) {
    const focused = inter.options.getFocused().toLowerCase();
    const filtered = categories.filter(c => c.startsWith(focused)).slice(0, 25);
    await inter.respond(filtered.map(c => ({ name: c, value: c })));
    return;
  }

  if (!inter.isCommand()) return;

  if (inter.commandName === 'genshininpact') {
    const cat = inter.options.getString('category').toLowerCase();
    if (!categories.includes(cat)) {
      await inter.reply({
        content: `❌ Nieznana kategoria! Dostępne: \n${categories.join(', ')}`,
        ephemeral: true
      });
      return;
    }

    const url = `https://api.fluxpoint.dev/nsfw/img/${cat}`;
    await sendImage(inter, url, cat);
  }

  if (inter.commandName === 'hentai') {
    const url = `https://api.fluxpoint.dev/nsfw/gif/hentai`;
    await sendGif(inter, url, 'hentai');
  }

  if (inter.commandName === 'leagueoflegends') {
    await sendRandomFromArray(inter, lolImages, "League of Legends");
  }

  if (inter.commandName === 'zenlesszonezero') {
    await sendRandomFromArray(inter, zzzImages, "Zenless Zone Zero");
  }
});

// 🔹 Funkcja obrazki (API)
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
        footer: { text: "Powered by VeyraTeam" },
        color: 0xFF00FF
      }]
    });
  } catch (err) {
    console.error(err);
    await inter.editReply('Nie udało się pobrać obrazka.');
  }
}

// 🔹 Funkcja gif
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
        footer: { text: "Powered by VeyraTeam" },
        color: 0xFF00FF
      }]
    });
  } catch (err) {
    console.error(err);
    await inter.editReply('Nie udało się pobrać gifa.');
  }
}

// 🔹 Funkcja losowe zdjęcie z tablicy
async function sendRandomFromArray(inter, array, title) {
  await inter.deferReply();
  try {
    const randomImage = array[Math.floor(Math.random() * array.length)];
    if (!randomImage) throw new Error('Brak obrazków w tablicy');

    await inter.editReply({
      embeds: [{
        title: title,
        image: { url: randomImage },
        footer: { text: "Powered by VeyraTeam" },
        color: 0xFF00FF
      }]
    });
  } catch (err) {
    console.error(err);
    await inter.editReply(`❌ Nie udało się pobrać obrazka (${title}).`);
  }
}

client.login(token);
