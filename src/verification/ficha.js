const {
  ContainerBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');

/**
 * Envia a ficha de solicitação para o canal de moderadores
 */
async function enviarFicha(client, applicantId, selectedUserId) {
  const fichasChannelId = process.env.FICHAS_CHANNEL_ID;
  const fichasChannel = client.channels.cache.get(fichasChannelId);

  if (!fichasChannel) {
    console.error("Canal de fichas não encontrado.");
    return;
  }

  // Constrói o visual da ficha usando Components V2
  const components = [
    new ContainerBuilder()
      .setAccentColor(parseInt(process.env.MAIN_EMBED_COLOR))
      .addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL("https://cdn3.emoji.gg/emojis/1415-moderator.png")
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## Ficha de <@${applicantId}>`),
            new TextDisplayBuilder().setContent(`O usuário selecionou o membro <@${selectedUserId}>.`),
            new TextDisplayBuilder().setContent("Apenas aceite o usuário caso ele possua uma relação amigável com o membro selecionado."),
          ),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("-# _<@&1454373315316813874> Caso este usuário seja negado, ele será expulso do servidor._"),
      ),
  ];

  // Cria os botões de Aceitar e Negar
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel("Aceitar")
        // Armazena IDs no customId para uso posterior
        .setCustomId(`accept_verification_${applicantId}_${selectedUserId}`),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel("Negar")
        .setCustomId(`deny_verification_${applicantId}_${selectedUserId}`),
    );

  // Envia a mensagem para o canal
  await fichasChannel.send({
    components: [...components, row],
    flags: MessageFlags.IsComponentsV2,
    files: [{ attachment: 'https://cdn3.emoji.gg/emojis/1415-moderator.png', name: 'mod.png' }],
  });
}

module.exports = { enviarFicha };
