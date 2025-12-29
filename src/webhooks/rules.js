const path = require('path');
// Aponta para o arquivo .env na raiz do projeto (dois níveis acima desta pasta)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const {
  Client,
  GatewayIntentBits,
  SectionBuilder,
  TextDisplayBuilder,
  ContainerBuilder,
  MessageFlags,
  ThumbnailBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Define o canal onde a mensagem será enviada
const CHANNEL_ID = process.env.RULES_CHANNEL_ID;

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
      .addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL("https://cdn3.emoji.gg/emojis/2260-rules.png")
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## Regras"),
            new TextDisplayBuilder().setContent("Para manter o ambiente **seguro** e **acolhedor**, siga as regras abaixo com respeito e bom senso:"),
            new TextDisplayBuilder().setContent("-# _Qualquer desrespeito às regras do servidor resultará em banimento._"),
          ),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 1. Seja respeitoso com todos no servidor"),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Queremos que este servidor seja um lugar amigável para todos. **Respeite as opiniões, crenças e limites dos outros.**"),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 2. Nada de discurso de ódio, racismo ou discriminação"),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Qualquer forma de **discurso de ódio**, **comentários racistas**, **sexistas** ou **ataques** com base em religião ou identidade  não serão tolerados."),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 3. Mantenha o conteúdo apropriado"),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Conteúdo **NSFW** (impróprio para o trabalho), **gore** ou **ofensivo** não é permitido. Isso inclui imagens e mensagens."),
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
