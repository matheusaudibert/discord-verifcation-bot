/**
 * Tenta enviar uma mensagem direta (DM) para um usuário.
 * Trata erros caso o usuário tenha DMs fechadas.
 */
async function enviarDM(user, content) {
  if (!user) return;
  try {
    await user.send(content);
  } catch (e) {
    console.log(`Não foi possível enviar DM para ${user.id}:`, e.message);
  }
}

module.exports = { enviarDM };
