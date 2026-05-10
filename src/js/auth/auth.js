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

function usuarioJaExiste(username, email) {
    return users.some(u => u.username === username || u.email === email);
}

function registrarNovoCliente(username, email, password) {
    // Validar se usuário ou email já existem
    if (usuarioJaExiste(username, email)) {
        return {
            sucesso: false,
            mensagem: 'Usuário ou email já cadastrado!'
        };
    }

    // Criar novo usuário
    const novoId = Math.max(...users.map(u => u.id), 0) + 1;
    const novoUsuario = {
        id: novoId,
        username: username,
        email: email,
        password: password,
        type: 'cliente'
    };

    // Adicionar à array de usuários
    users.push(novoUsuario);

    // Salvar no localStorage como usuário atual
    salvarUsuario(novoUsuario);

    // Tentar salvar no JSON (simulado via localStorage)
    salvarUsuariosNoStorage(users);

    return {
        sucesso: true,
        user: novoUsuario,
        mensagem: 'Cadastro realizado com sucesso!'
    };
}

function salvarUsuariosNoStorage(usuariosArray) {
    // Como estamos em um ambiente front-end puro, vamos salvar em localStorage
    // Em um ambiente real, isso seria enviado para uma API backend
    localStorage.setItem('usuarios_backup', JSON.stringify(usuariosArray));
    console.log('Usuários salvos em localStorage');
}