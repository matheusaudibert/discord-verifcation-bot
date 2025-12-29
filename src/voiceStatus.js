const { joinVoiceChannel } = require('@discordjs/voice');

/**
 * Conecta o bot a um canal de voz específico e mantém a conexão.
 * @param {import('discord.js').Client} client 
 */
async function conectarCanalVoz(client) {
  const voiceChannelId = '1454493326433718496'; // ID do canal de voz
  const guildId = process.env.SERVER_ID; // ID do servidor

  // Tenta encontrar o canal para garantir que o bot tem acesso
  const channel = client.channels.cache.get(voiceChannelId);
  if (!channel) {
    console.error('Canal de voz não encontrado.');
    return;
  }

  try {
    joinVoiceChannel({
      channelId: voiceChannelId,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });

    console.log(`Bot conectado ao canal de voz: ${channel.name}`);

    // Nota: A API de bots oficial atualmente não suporta definir o "Voice Status" 
    // (aquele texto/emoji pequeno dentro da call) da mesma forma que usuários normais.
    // O status "Streaming" definido no index.js é o que aparecerá no perfil.

  } catch (error) {
    console.error('Erro ao conectar no canal de voz:', error);
  }
}

module.exports = { conectarCanalVoz };
