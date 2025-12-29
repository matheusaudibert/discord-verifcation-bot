const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const {
  Client,
  GatewayIntentBits,
  ContainerBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  TextDisplayBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags
} = require("discord.js");
const puppeteer = require("puppeteer");

const CHANNEL_ID = "1454494607873282149";

const BASE_URL =
  "https://cardzera.audibert.dev/api/1454345286854901805" +
  "?backgroundColor=ffffff" +
  "&buttonColor=000000" +
  "&buttonBorderRadius=" +
  "&buttonText=entre%20na%20resenha" +
  "&buttonTextColor=ffffff" +
  "&infoColor=353535" +
  "&nameColor=000000" +
  "&borderRadius=10" +
  "&titleLen=8" +
  "&elipsis=true";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let lastMessage = null; // Variável para armazenar a referência da mensagem

function buildUrl() {
  return `${BASE_URL}&t=${Date.now()}`;
}

async function sendPng() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    console.error("Canal inválido ou não é de texto.");
    return;
  }

  // Lança um navegador headless para renderizar o SVG exatamente como no browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Define escala 2x para garantir alta qualidade (Retina)
  await page.setViewport({ width: 800, height: 600, deviceScaleFactor: 2 });

  await page.goto(buildUrl(), { waitUntil: 'networkidle0' });

  // Seleciona o elemento SVG e tira um print com fundo transparente
  const svgElement = await page.$('svg');

  if (!svgElement) {
    console.error("SVG não encontrado.");
    await browser.close();
    return;
  }

  const pngBuffer = await svgElement.screenshot({ type: 'png', omitBackground: true });

  await browser.close();

  const components = [
    new ContainerBuilder()
      .setAccentColor(parseInt(process.env.MAIN_EMBED_COLOR))
      .addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL("https://cdn3.emoji.gg/emojis/8454-website.png")
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## Convite"),
            new TextDisplayBuilder().setContent("Este é o **convite oficial** do servidor e deve ser utilizado para entrar e convidar novas pessoas para a **resenha**."),
            new TextDisplayBuilder().setContent("-# _Convide apenas pessoas resenhudas._"),
          ),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### **https://discord.gg/pwMnYwhEt2**"),
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder()
          .addItems(
            new MediaGalleryItemBuilder()
              .setURL("attachment://cardzera.png"),
          ),
      ),
  ];

  const payload = {
    components: components,
    flags: MessageFlags.IsComponentsV2,
    files: [{ attachment: pngBuffer, name: "cardzera.png" }],
  };

  // Tenta encontrar a última mensagem do bot se não tivermos a referência
  if (!lastMessage) {
    try {
      const messages = await channel.messages.fetch({ limit: 10 });
      const botMessage = messages.find(m => m.author.id === client.user.id);
      if (botMessage) lastMessage = botMessage;
    } catch (e) {
      console.error("Erro ao buscar mensagens antigas:", e);
    }
  }

  if (lastMessage) {
    try {
      lastMessage = await lastMessage.edit(payload);
      console.log("✅ Mensagem editada com sucesso (renderizado via Puppeteer)");
    } catch (error) {
      console.error("Erro ao editar mensagem, enviando nova:", error);
      lastMessage = await channel.send(payload);
    }
  } else {
    lastMessage = await channel.send(payload);
    console.log("✅ Mensagem enviada com sucesso (renderizado via Puppeteer)");
  }
}

client.once("ready", async () => {
  console.log(`🤖 Online como ${client.user.tag}`);

  await sendPng();

  // Atualiza a cada 10 minutos
  setInterval(sendPng, 10 * 60 * 1000);
});

client.login(process.env.BOT_TOKEN);
