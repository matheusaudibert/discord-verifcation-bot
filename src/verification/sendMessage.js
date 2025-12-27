/**
 * Envia uma mensagem de boas-vindas no chat geral
 */
async function enviarMensagemBoasVindas(client, userId) {
  const channelId = process.env.CHAT_CHANNEL_ID;
  const channel = client.channels.cache.get(channelId);

  if (!channel) {
    console.error('Canal de chat geral não encontrado.');
    return;
  }

  try {
    await channel.send(`seja bem-vindo (a) à resenha <@${userId}>`);
  } catch (err) {
    console.error('Erro ao enviar mensagem de boas-vindas:', err);
  }
}

module.exports = { enviarMensagemBoasVindas };
