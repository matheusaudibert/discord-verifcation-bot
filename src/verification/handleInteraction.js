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
    const selectedUserId = interaction.values[0]; // ID do usuário selecionado no menu
    const applicantId = interaction.user.id; // ID de quem está tentando entrar

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
    const { customId, member, guild } = interaction;

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

      // Extrai IDs do customId do botão (ex: accept_verification_USERID_TARGETID)
      const parts = customId.split('_');
      const applicantId = parts[2];
      const selectedUserId = parts[3] || "Desconhecido";
      const isAccept = customId.startsWith('accept_verification_');

      // Tenta buscar o usuário no servidor
      const applicant = await guild.members.fetch(applicantId).catch(() => null);

      // Se for aceitar e o usuário não estiver mais no servidor, avisa o mod
      if (!applicant && isAccept) {
        return interaction.reply({ content: "O usuário saiu do servidor.", ephemeral: true });
      }

      // Confirma a interação para o Discord não dar timeout
      await interaction.deferUpdate();

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
