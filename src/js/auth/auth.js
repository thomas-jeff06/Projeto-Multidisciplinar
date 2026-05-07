/**
 * Serviço de Autenticação
 * Responsável por lógica de login e autenticação
 */

function validarCredenciais(username, password) {
    return users.find(u => u.username === username && u.password === password);
}

function fazerLogin(username, password) {
    const user = validarCredenciais(username, password);

    if (user) {
        salvarUsuario(user);
        return { sucesso: true, user: user };
    }

    return { sucesso: false, mensagem: "Usuário ou senha incorretos!" };
}

function fazerLogout() {
    limparUsuario();
}

function obterTipoUsuarioAtual() {
    const user = obterUsuario();
    return user ? user.type : null;
}

function redirecionarPorTipo(tipo) {
    const rotas = {
        'admin': 'pages/admin.html',
        'cliente': 'pages/cliente.html',
        'cozinheiro': 'pages/cozinheiro.html',
        'atendente': 'pages/atendente.html'
    };

    const rota = rotas[tipo] || 'pages/cliente.html';
    window.location.href = rota;
}