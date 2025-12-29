const path = require('path');
// Aponta para o arquivo .env na raiz do projeto (dois níveis acima desta pasta)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const {
  Client,
  GatewayIntentBits,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  TextDisplayBuilder,
  ContainerBuilder,
  MessageFlags
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Define o canal onde a mensagem será enviada
const CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

client.once('ready', async () => {
  console.log(`Logado como ${client.user.tag} para envio de mensagem.`);

  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel) {
    console.error(`Canal ${CHANNEL_ID} não encontrado.`);
    client.destroy();
    process.exit(1);
  }

  const components = [
    new ContainerBuilder()
      .setAccentColor(parseInt(process.env.MAIN_EMBED_COLOR))
      .addMediaGalleryComponents(
        new MediaGalleryBuilder()
          .addItems(
            new MediaGalleryItemBuilder()
              .setURL("https://i.postimg.cc/jjJM0swB/resenha.gif"),
          ),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("# resenha "),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("A **resenha** é um servidor de interação criado para **trocar ideias**, **conversar**, **participar das calls**  e **resenhar**  de forma saudável. o servidor **não é uma panela**, mas também não é aberto para qualquer um, já que a entrada acontece mediante aceitação para manter um ambiente organizado, respeitoso e alinhado com a proposta do servidor."),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("A **resenha** é uma iniciativa de <@161092845040566272>."),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("-# Ao entrar na **resenha**, você concorda em seguir os **_[Termos de Serviço](https://discord.com/terms)_** e as **_[Diretrizes da Comunidade](https://discord.com/guidelines)_** do **Discord**, além das <#1454493500576895230> internas do servidor."),
      ),
  ];

  try {
    await channel.send({
      components: components,
      flags: MessageFlags.IsComponentsV2
    });
    console.log('Mensagem enviada com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }

  client.destroy();
  process.exit(0);
});

client.login(process.env.BOT_TOKEN);
