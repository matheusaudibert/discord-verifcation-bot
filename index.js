require('dotenv').config(); // Carrega variáveis de ambiente do .env
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { enviarPainelVerificacao } = require('./src/verification/verify.js');
const { handleInteraction } = require('./src/verification/handleInteraction.js');
const { conectarCanalVoz } = require('./src/voiceStatus.js');

// Configuração do Cliente do Bot com as permissões necessárias (Intents)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Evento: Quando uma interação (botão, menu) é criada
client.on('interactionCreate', (interaction) => handleInteraction(interaction));

// Evento: Quando o bot está pronto e online
client.once('clientReady', async () => {
  console.log(`A resenha está on como ${client.user.tag}.`);

  // Define o status do bot (Streaming)
  client.user.setPresence({
    activities: [{
      name: 'a resenha está on',
      type: ActivityType.Streaming,
      url: 'https://www.twitch.tv/resenha',
    }],
    status: 'online',
  });

  // Conecta no canal de voz
  await conectarCanalVoz(client);

  // Envia/Atualiza o painel de verificação ao iniciar
  await enviarPainelVerificacao(client);
});

// Login do bot usando o token
client.login(process.env.BOT_TOKEN);
