/**
 * Login Page Script
 * Controla a lógica da página de login
 */

document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados
    carregarDados();

    // Se já estiver logado, redirecionar
    const user = obterUsuario();
    if (user) {
        redirecionarPorTipo(user.type);
    }
});

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const mensagemErro = document.getElementById("mensagemErro");

    // Aguardar dados serem carregados
    await aguardarDadosCarregados();

    const resultado = fazerLogin(username, password);

    if (resultado.sucesso) {
        if (!lgpdAceito()) {
            document.getElementById("lgpd").classList.remove("hidden");
        } else {
            redirecionarPorTipo(resultado.user.type);
        }
    } else {
        mensagemErro.textContent = resultado.mensagem;
        document.getElementById("password").value = "";
    }
}

function handleLGPD() {
    aceitarLGPD();
    const user = obterUsuario();
    redirecionarPorTipo(user.type);
}