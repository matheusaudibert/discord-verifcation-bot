const { ActionRowBuilder } = require('discord.js');
const { registrarLog } = require('./logs.js');
const { enviarFicha } = require('./ficha.js');
const { enviarDM } = require('./sendDM.js');
const { enviarMensagemBoasVindas } = require('./sendMessage.js');

/**
 * Função principal para lidar com interações (Select Menus e Botões)
 * @param {import('discord.js').Interaction} interaction 
 */
async function handleInteraction(interaction) {
  // --- Lógica do Menu de Seleção (Usuário envia a ficha) ---
  if (interaction.isUserSelectMenu() && interaction.customId === 'verificar_usuario') {
    const applicantId = interaction.user.id; // ID de quem está tentando entrar

    // Verifica se o usuário possui o cargo de convidado
    if (!interaction.member.roles.cache.has(process.env.GUEST_ROLE_ID)) {
      return interaction.reply({
        content: `Para se verificar é necessário o cargo de <@&${process.env.GUEST_ROLE_ID}>.`,
        ephemeral: true
      });
    }

    // --- VERIFICAÇÃO DE FICHA DUPLICADA ---
    const fichasChannelId = process.env.FICHAS_CHANNEL_ID;
    const fichasChannel = interaction.client.channels.cache.get(fichasChannelId);

    if (fichasChannel) {
      try {
        // Busca as últimas 50 mensagens para ver se o usuário já tem uma ficha pendente
        const messages = await fichasChannel.messages.fetch({ limit: 50 });
        const hasActiveRequest = messages.some(msg => {
          // Procura nos botões da mensagem se o customId contém o ID do usuário
          // O formato do ID é: accept_verification_USERID_TARGETID
          return msg.components.some(row =>
            row.components.some(component =>
              component.customId && component.customId.startsWith(`accept_verification_${applicantId}_`)
            )
          );
        });

        if (hasActiveRequest) {
          return interaction.reply({
            content: "Você já tem uma ficha em aberto.",
            ephemeral: true
          });
        }
      } catch (error) {
        console.error("Erro ao verificar fichas duplicadas:", error);
      }
    }
    // --------------------------------------

    const selectedUserId = interaction.values[0]; // ID do usuário selecionado no menu

    // Responde apenas para o usuário que interagiu (Ephemeral)
    await interaction.reply({
      content: "Ficha enviada com sucesso.",
      ephemeral: true
    });

    // Chama a função para criar e enviar a ficha no canal de moderadores
    await enviarFicha(interaction.client, applicantId, selectedUserId);
  }

  // --- Lógica dos Botões (Moderador Aceita ou Nega) ---
  if (interaction.isButton()) {
    const { customId, member, guild, message } = interaction;

    // Verifica se o botão clicado é de aceitar ou negar verificação
    if (customId.startsWith('accept_verification_') || customId.startsWith('deny_verification_')) {

      // Lista de cargos permitidos para moderar
      const allowedRoles = [
        process.env.ADMIN_ROLE_ID,
        process.env.MODERATOR_ROLE_ID,
        process.env.LOGS_ROLE_ID
      ];

      // Verifica se quem clicou tem permissão
      const hasPermission = member.roles.cache.some(role => allowedRoles.includes(role.id));

      if (!hasPermission) {
        return interaction.reply({
          content: "Você não tem permissão para gerenciar as fichas de verificação",
          ephemeral: true
        });
      }

      // 1. Tenta desabilitar os botões imediatamente para evitar cliques duplos
      try {
        const newComponents = message.components.map(c => {
          // Se for uma ActionRow (tipo 1) e tiver botões (tipo 2)
          if (c.type === 1 && c.components.some(child => child.type === 2)) {
            const builder = ActionRowBuilder.from(c);
            builder.components.forEach(btn => btn.setDisabled(true));
            return builder;
          }
          // Retorna outros componentes (ex: Container) como JSON para não quebrar
          return c.toJSON();
        });

        // Atualiza a mensagem desabilitando os botões
        await interaction.update({ components: newComponents });
      } catch (error) {
        // Se falhar (ex: outro mod clicou milissegundos antes), para a execução
        console.log("Interação já processada ou erro ao atualizar:", error.message);
        return;
      }

      // Extrai IDs do customId do botão (ex: accept_verification_USERID_TARGETID)
      const parts = customId.split('_');
      const applicantId = parts[2];
      const selectedUserId = parts[3] || "Desconhecido";
      const isAccept = customId.startsWith('accept_verification_');

      // Tenta buscar o usuário no servidor
      const applicant = await guild.members.fetch(applicantId).catch(() => null);

      // Se o usuário não estiver mais no servidor (seja para aceitar ou negar)
      if (!applicant) {
        // Usa followUp pois já deu update na interação
        await interaction.followUp({ content: "O membro não está mais no servidor.", ephemeral: true });
        await interaction.message.delete().catch(console.error);
        return;
      }

      if (isAccept) {
        // --- CASO ACEITO ---
        if (applicant) {
          // Avisa no PV
          await enviarDM(applicant, "Você foi aceito na **Resenha**.");
          // Adiciona cargo de membro e remove convidado
          await applicant.roles.add(process.env.MEMBER_ROLE_ID).catch(console.error);
          await applicant.roles.remove(process.env.GUEST_ROLE_ID).catch(console.error);

          // Envia mensagem no chat geral
          await enviarMensagemBoasVindas(interaction.client, applicantId);
        }
        // Registra no canal de logs
        await registrarLog(interaction.client, 'aceito', member, { id: applicantId }, selectedUserId);
      } else {
        // --- CASO NEGADO ---
        if (applicant) {
          // Avisa no PV antes de expuslar
          await enviarDM(applicant, "Você não foi aceito na **Resenha**.");
          // Expulsa o usuário
          await applicant.kick("Verificação negada.").catch(console.error);
        }
        // Registra no canal de logs
        await registrarLog(interaction.client, 'negado', member, { id: applicantId }, selectedUserId);
      }

      // Apagar a mensagem da ficha após processar a decisão
      await interaction.message.delete().catch(console.error);
    }
  }
}

module.exports = { handleInteraction };
