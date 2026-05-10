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

function irParaCadastro() {
    document.getElementById('login').classList.add('hidden');
    document.getElementById('cadastro').classList.remove('hidden');
    limparMensagensCadastro();
    limparCamposCadastro();
}

function voltarParaLogin() {
    document.getElementById('cadastro').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
    document.getElementById('mensagemErro').textContent = '';
    limparCamposCadastro();
}

function limparMensagensCadastro() {
    document.getElementById('mensagemCadastroErro').textContent = '';
    document.getElementById('mensagemCadastroSucesso').textContent = '';
}

function limparCamposCadastro() {
    document.getElementById('cadastroUsername').value = '';
    document.getElementById('cadastroEmail').value = '';
    document.getElementById('cadastroPassword').value = '';
    document.getElementById('cadastroConfirmPassword').value = '';
}

async function handleCadastro(event) {
    event.preventDefault();

    const username = document.getElementById('cadastroUsername').value;
    const email = document.getElementById('cadastroEmail').value;
    const password = document.getElementById('cadastroPassword').value;
    const confirmPassword = document.getElementById('cadastroConfirmPassword').value;
    const mensagemErro = document.getElementById('mensagemCadastroErro');
    const mensagemSucesso = document.getElementById('mensagemCadastroSucesso');

    // Limpar mensagens
    mensagemErro.textContent = '';
    mensagemSucesso.textContent = '';

    // Validar se as senhas coincidem
    if (password !== confirmPassword) {
        mensagemErro.textContent = '❌ As senhas não coincidem!';
        return;
    }

    // Validar comprimento mínimo da senha
    if (password.length < 3) {
        mensagemErro.textContent = '❌ A senha deve ter no mínimo 3 caracteres!';
        return;
    }

    // Validar se email é válido
    if (!email.includes('@')) {
        mensagemErro.textContent = '❌ Email inválido!';
        return;
    }

    // Validar comprimento do username
    if (username.length < 3) {
        mensagemErro.textContent = '❌ Usuário deve ter no mínimo 3 caracteres!';
        return;
    }

    // Aguardar dados serem carregados
    await aguardarDadosCarregados();

    const resultado = registrarNovoCliente(username, email, password);

    if (resultado.sucesso) {
        mensagemSucesso.textContent = '✅ Cadastro realizado com sucesso!';
        limparCamposCadastro();

        // Voltar para login após 3 segundos
        setTimeout(() => {
            voltarParaLogin();
        }, 3000);
    } else {
        mensagemErro.textContent = '❌ ' + resultado.mensagem;
    }
}