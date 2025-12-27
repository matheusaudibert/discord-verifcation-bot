const {
  ActionRowBuilder,
  UserSelectMenuBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  SectionBuilder,
  ContainerBuilder,
  MessageFlags
} = require('discord.js');

/**
 * Envia o painel principal de verificação para o canal público.
 * Limpa o chat antes de enviar para manter o canal limpo.
 */
async function enviarPainelVerificacao(client) {
  const channelId = process.env.VERIFICATION_CHANNEL_ID;
  const channel = client.channels.cache.get(channelId);

  if (!channel) {
    console.log('Canal de verificação não encontrado.');
    return;
  }

  // Limpar mensagens antigas do canal (até 100)
  try {
    const messages = await channel.messages.fetch({ limit: 100 });
    if (messages.size > 0) await channel.bulkDelete(messages);
  } catch (err) {
    console.error('Erro ao limpar chat:', err);
  }

  // Constrói o painel de boas-vindas
  const components = [
    new ContainerBuilder()
      .setAccentColor(parseInt(process.env.MAIN_EMBED_COLOR))
      .addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL('https://cdn3.emoji.gg/emojis/7549-member.png')
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## Verifique-se'),
            new TextDisplayBuilder().setContent('Seja bem-vindo(a) à **Resenha**!'),
            new TextDisplayBuilder().setContent(
              'Para entrar no servidor, você precisa conhecer alguém que já faz parte da Resenha. No menu abaixo, **selecione alguém que você conhece do servidor** para confirmar seu acesso.'
            ),
          ),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          '-# _Caso seu acesso seja negado, você será expulso do servidor._'
        ),
      ),
  ];

  // Cria o menu de seleção de usuários
  const row = new ActionRowBuilder()
    .addComponents(
      new UserSelectMenuBuilder()
        .setCustomId('verificar_usuario')
        .setPlaceholder('Selecione quem você conhece do servidor')
        .setMinValues(1)
        .setMaxValues(1)
    );

  // Envia o painel
  await channel.send({
    components: [...components, row],
    flags: MessageFlags.IsComponentsV2,
    files: [
      {
        attachment: 'https://cdn3.emoji.gg/emojis/7549-member.png',
        name: 'https://cdn3.emoji.gg/emojis/7549-member.png',
      },
    ],
  });
}

module.exports = { enviarPainelVerificacao };
