const {
  ContainerBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  TextDisplayBuilder,
  MessageFlags
} = require('discord.js');

/**
 * Registra o resultado da verificação (Aceito/Negado) no canal de logs
 */
async function registrarLog(client, tipo, moderador, usuario, alvoSelecionado) {
  const channelId = process.env.LOGS_FICHAS_CHANNEL_ID;
  const channel = client.channels.cache.get(channelId);

  if (!channel) {
    console.error('Canal de logs de fichas não encontrado.');
    return;
  }

  // Define textos e imagens baseados na decisão (aceito ou negado)
  const isAceito = tipo === 'aceito';
  const titulo = isAceito
    ? `### O acesso de <@${usuario.id}> ao servidor foi **ACEITO**.`
    : `### O acesso de <@${usuario.id}> ao servidor foi **NEGADO**.`;

  const acao = isAceito ? '**aceito**' : '**negado**';
  const imagemUrl = isAceito
    ? "https://cdn3.emoji.gg/emojis/6725-join.png"
    : "https://cdn3.emoji.gg/emojis/5167-leave.png";

  // Constrói o log visual
  const components = [
    new ContainerBuilder()
      .setAccentColor(parseInt(process.env.MAIN_EMBED_COLOR))
      .addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL(imagemUrl)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(titulo),
            new TextDisplayBuilder().setContent(`O usuário selecionou o membro <@${alvoSelecionado}> e foi ${acao} pelo moderador <@${moderador.id}>.`),
            new TextDisplayBuilder().setContent("-# _<@&1454373315316813874> Não apague esse registro._"),
          ),
      ),
  ];

  // Envia o log
  await channel.send({
    components,
    flags: MessageFlags.IsComponentsV2,
    files: [{ attachment: imagemUrl, name: 'status.png' }]
  });
}

module.exports = { registrarLog };
