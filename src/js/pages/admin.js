/**
 * Admin Page Script
 * Funcionalidades específicas para administradores
 */

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = obterUsuario();

    if (!currentUser || currentUser.type !== 'admin') {
        window.location.href = '../index.html';
        return;
    }

    carregarDados().then(() => {
        atualizarBemVindo();
        atualizarDashboard();
    });
});

function atualizarBemVindo() {
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl && currentUser) {
        const tipo = currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1);
        welcomeEl.textContent = `Bem-vindo ${tipo}`;
    }
}

function sair() {
    fazerLogout();
    window.location.href = '../index.html';
}

// Funções de navegação entre seções
function mostrarDashboard() {
    mostrarSecao('dashboard-section');
    atualizarDashboard();
    marcarBotaoAtivo(0);
}

function mostrarUsuarios() {
    mostrarSecao('usuarios-section');
    marcarBotaoAtivo(1);
    renderizarUsuarios();
}

function mostrarLojas() {
    mostrarSecao('lojas-section');
    marcarBotaoAtivo(2);
    renderizarLojas();
}

function mostrarProdutos() {
    mostrarSecao('produtos-section');
    marcarBotaoAtivo(3);
    carregarSelecaoLojasProdutos();
    renderizarProdutos();
}

function mostrarPedidos() {
    mostrarSecao('pedidos-section');
    marcarBotaoAtivo(4);
    carregarSelecaoLojasPedidos();
    renderizarPedidosAdmin();
}

function mostrarSecao(secaoId) {
    // Esconder todas as seções
    const secoes = document.querySelectorAll('.admin-section');
    secoes.forEach(secao => secao.classList.add('hidden'));

    // Mostrar a seção selecionada
    const secaoSelecionada = document.getElementById(secaoId);
    if (secaoSelecionada) {
        secaoSelecionada.classList.remove('hidden');
    }
}

function marcarBotaoAtivo(index) {
    const botoes = document.querySelectorAll('.admin-menu-btn');
    botoes.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

async function renderizarUsuarios() {
    await aguardarDadosCarregados();
    const filtro = document.getElementById('usuarioSearch')?.value.toLowerCase() || '';
    const tbody = document.getElementById('usuariosTable');
    const mensagem = document.getElementById('usuarioMensagem');
    if (!tbody || !mensagem) return;

    mensagem.textContent = '';
    const usuariosFiltrados = users.filter(user => {
        return user.username.toLowerCase().includes(filtro) ||
            user.email.toLowerCase().includes(filtro) ||
            user.type.toLowerCase().includes(filtro);
    });

    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhum usuário encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = usuariosFiltrados.map(user => {
        const tipo = user.type.charAt(0).toUpperCase() + user.type.slice(1);
        return `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${tipo}</td>
                <td class="table-actions">
                    <button class="action-btn edit-btn" onclick="abrirEditarUsuario(${user.id})">Editar</button>
                    <button class="action-btn delete-btn" onclick="excluirUsuario(${user.id})">Excluir</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filtrarUsuarios() {
    renderizarUsuarios();
}

function abrirEditarUsuario(userId) {
    const usuario = users.find(u => u.id === userId);
    if (!usuario) return;

    document.getElementById('usuarioFormTitle').textContent = 'Editar Usuário';
    document.getElementById('usuarioId').value = usuario.id;
    document.getElementById('usuarioUsername').value = usuario.username;
    document.getElementById('usuarioEmail').value = usuario.email;
    document.getElementById('usuarioTipo').value = usuario.type;
    document.getElementById('usuarioPassword').value = '';
    document.getElementById('usuarioMensagem').textContent = '';
    document.getElementById('usuarioForm')?.classList.remove('hidden');
}

function abrirNovoUsuario() {
    document.getElementById('usuarioFormTitle').textContent = 'Novo Usuário';
    document.getElementById('usuarioId').value = '';
    document.getElementById('usuarioUsername').value = '';
    document.getElementById('usuarioEmail').value = '';
    document.getElementById('usuarioTipo').value = 'cliente';
    document.getElementById('usuarioPassword').value = '';
    document.getElementById('usuarioMensagem').textContent = '';
    document.getElementById('usuarioForm')?.classList.remove('hidden');
}

function fecharFormUsuario() {
    document.getElementById('usuarioForm')?.classList.add('hidden');
    document.getElementById('usuarioMensagem').textContent = '';
}

function salvarUsuarioEdicao(event) {
    event.preventDefault();

    const id = Number(document.getElementById('usuarioId').value);
    const username = document.getElementById('usuarioUsername').value.trim();
    const email = document.getElementById('usuarioEmail').value.trim();
    const type = document.getElementById('usuarioTipo').value;
    const password = document.getElementById('usuarioPassword').value;
    const mensagem = document.getElementById('usuarioMensagem');

    mensagem.textContent = '';

    if (username.length < 3) {
        mensagem.textContent = 'Nome de usuário deve ter pelo menos 3 caracteres.';
        return;
    }

    if (!email.includes('@')) {
        mensagem.textContent = 'Email inválido.';
        return;
    }

    const existente = users.find(u => (u.username === username || u.email === email) && u.id !== id);
    if (existente) {
        mensagem.textContent = 'Já existe outro usuário com esse nome ou email.';
        return;
    }

    if (id) {
        const usuario = users.find(u => u.id === id);
        if (!usuario) {
            mensagem.textContent = 'Usuário não encontrado.';
            return;
        }
        usuario.username = username;
        usuario.email = email;
        usuario.type = type;
        if (password.trim().length > 0) {
            if (password.length < 3) {
                mensagem.textContent = 'A senha deve ter pelo menos 3 caracteres.';
                return;
            }
            usuario.password = password;
        }
    } else {
        if (password.trim().length < 3) {
            mensagem.textContent = 'A senha deve ter pelo menos 3 caracteres.';
            return;
        }
        const novoId = Math.max(...users.map(u => u.id), 0) + 1;
        users.push({ id: novoId, username, email, password: password, type });
    }

    if (typeof salvarUsuariosNoStorage === 'function') {
        salvarUsuariosNoStorage(users);
    }

    fecharFormUsuario();
    renderizarUsuarios();
    atualizarDashboard();
}

function excluirUsuario(userId) {
    const usuario = users.find(u => u.id === userId);
    if (!usuario) return;

    if (usuario.type === 'admin' && usuario.id === currentUser.id) {
        alert('Você não pode excluir seu próprio usuário administrador.');
        return;
    }

    if (!confirm(`Deseja excluir o usuário ${usuario.username}?`)) {
        return;
    }

    const index = users.findIndex(u => u.id === userId);
    if (index >= 0) {
        users.splice(index, 1);
        if (typeof salvarUsuariosNoStorage === 'function') {
            salvarUsuariosNoStorage(users);
        }
        renderizarUsuarios();
        atualizarDashboard();
    }
}

async function renderizarLojas() {
    await aguardarDadosCarregados();
    const filtro = document.getElementById('lojaSearch')?.value.toLowerCase() || '';
    const tbody = document.getElementById('lojasTable');
    const mensagem = document.getElementById('lojaMensagem');
    if (!tbody || !mensagem) return;

    mensagem.textContent = '';
    const lojasFiltradas = stores.filter(loja => {
        return loja.name.toLowerCase().includes(filtro);
    });

    if (lojasFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhuma loja encontrada.</td></tr>';
        return;
    }

    tbody.innerHTML = lojasFiltradas.map(loja => {
        const produtosCount = Array.isArray(loja.products) ? loja.products.length : 0;
        const funcionariosCount = Array.isArray(loja.employees) ? loja.employees.length : 0;
        return `
            <tr>
                <td>${loja.id}</td>
                <td>${loja.name}</td>
                <td>${produtosCount}</td>
                <td>${funcionariosCount}</td>
                <td class="table-actions">
                    <button class="action-btn edit-btn" onclick="abrirEditarLoja(${loja.id})">Editar</button>
                    <button class="action-btn delete-btn" onclick="excluirLoja(${loja.id})">Excluir</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filtrarLojas() {
    renderizarLojas();
}

function abrirEditarLoja(lojaId) {
    const loja = stores.find(l => l.id === lojaId);
    if (!loja) return;

    document.getElementById('lojaFormTitle').textContent = 'Editar Loja';
    document.getElementById('lojaId').value = loja.id;
    document.getElementById('lojaNome').value = loja.name;
    document.getElementById('lojaMensagem').textContent = '';
    document.getElementById('lojaForm')?.classList.remove('hidden');
}

function abrirNovaLoja() {
    document.getElementById('lojaFormTitle').textContent = 'Nova Loja';
    document.getElementById('lojaId').value = '';
    document.getElementById('lojaNome').value = '';
    document.getElementById('lojaMensagem').textContent = '';
    document.getElementById('lojaForm')?.classList.remove('hidden');
}

function fecharFormLoja() {
    document.getElementById('lojaForm')?.classList.add('hidden');
    document.getElementById('lojaMensagem').textContent = '';
}

function salvarLojaEdicao(event) {
    event.preventDefault();

    const id = Number(document.getElementById('lojaId').value);
    const nome = document.getElementById('lojaNome').value.trim();
    const mensagem = document.getElementById('lojaMensagem');

    mensagem.textContent = '';

    if (nome.length < 3) {
        mensagem.textContent = 'O nome da loja deve ter pelo menos 3 caracteres.';
        return;
    }

    const existente = stores.find(l => l.name.toLowerCase() === nome.toLowerCase() && l.id !== id);
    if (existente) {
        mensagem.textContent = 'Já existe outra loja com esse nome.';
        return;
    }

    if (id) {
        const loja = stores.find(l => l.id === id);
        if (!loja) {
            mensagem.textContent = 'Loja não encontrada.';
            return;
        }
        loja.name = nome;
    } else {
        const novoId = Math.max(...stores.map(l => l.id), 0) + 1;
        stores.push({ id: novoId, name: nome, products: [], employees: [] });
    }

    if (typeof salvarStoresNoStorage === 'function') {
        salvarStoresNoStorage(stores);
    }

    fecharFormLoja();
    renderizarLojas();
    atualizarDashboard();
}

function excluirLoja(lojaId) {
    const loja = stores.find(l => l.id === lojaId);
    if (!loja) return;

    if (!confirm(`Deseja excluir a loja ${loja.name}?`)) {
        return;
    }

    const index = stores.findIndex(l => l.id === lojaId);
    if (index >= 0) {
        stores.splice(index, 1);
        if (typeof salvarStoresNoStorage === 'function') {
            salvarStoresNoStorage(stores);
        }
        renderizarLojas();
        atualizarDashboard();
    }
}

function carregarSelecaoLojasProdutos() {
    const select = document.getElementById('produtosLojaSelect');
    if (!select) return;

    select.innerHTML = stores.map(loja => `<option value="${loja.id}">${loja.name}</option>`).join('');
    if (!select.value && stores.length > 0) {
        select.value = stores[0].id;
    }
}

function carregarSelecaoLojasPedidos() {
    const select = document.getElementById('pedidosLojaSelect');
    if (!select) return;

    select.innerHTML = `<option value="0">Todas as lanchonetes</option>` + stores.map(loja => `<option value="${loja.id}">${loja.name}</option>`).join('');
    if (!select.value) {
        select.value = '0';
    }
}

function filtrarPedidosPorLoja() {
    renderizarPedidosAdmin();
}

async function renderizarPedidosAdmin() {
    await aguardarDadosCarregados();
    const select = document.getElementById('pedidosLojaSelect');
    const lojaId = Number(select?.value || 0);
    const tbody = document.getElementById('pedidosTable');
    if (!tbody) return;

    const pedidosFiltrados = orders.filter(order => lojaId === 0 || order.storeId === lojaId);
    if (pedidosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum pedido encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = pedidosFiltrados.map(order => {
        const usuario = obterUsuarioPorId(order.userId);
        const nomeUsuario = usuario ? usuario.username : `Usuário ${order.userId}`;
        const loja = obterLojaPorId(order.storeId);
        const nomeLoja = loja ? loja.name : `Loja ${order.storeId}`;
        const itensTexto = order.itens.map(item => {
            const produto = obterProdutoPorId(item.id);
            const nome = produto ? produto.name : `Produto ${item.id}`;
            return `${item.quantity}x ${nome}`;
        }).join(', ');
        return `
            <tr>
                <td>${order.id}</td>
                <td>${nomeUsuario}</td>
                <td>${nomeLoja}</td>
                <td>${itensTexto}</td>
                <td>R$ ${order.total.toFixed(2)}</td>
                <td>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</td>
            </tr>`;
    }).join('');
}

async function renderizarProdutos() {
    await aguardarDadosCarregados();
    const select = document.getElementById('produtosLojaSelect');
    if (!select) return;
    const lojaId = Number(select.value || stores[0]?.id || 0);
    const tbody = document.getElementById('produtosTable');
    const mensagem = document.getElementById('produtoMensagem');
    if (!tbody || !mensagem) return;

    mensagem.textContent = '';
    const produtosFiltrados = products.filter(prod => prod.storeId === lojaId);

    if (produtosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhum produto encontrado para esta loja.</td></tr>';
        return;
    }

    tbody.innerHTML = produtosFiltrados.map(prod => {
        return `
            <tr>
                <td>${prod.id}</td>
                <td>${prod.name}</td>
                <td>R$ ${prod.price.toFixed(2)}</td>
                <td>${prod.available ? 'Sim' : 'Não'}</td>
                <td class="table-actions">
                    <button class="action-btn edit-btn" onclick="abrirEditarProduto(${prod.id})">Editar</button>
                    <button class="action-btn delete-btn" onclick="excluirProduto(${prod.id})">Excluir</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filtrarProdutosPorLoja() {
    renderizarProdutos();
}

function abrirEditarProduto(produtoId) {
    const produto = products.find(p => p.id === produtoId);
    if (!produto) return;

    document.getElementById('produtoFormTitle').textContent = 'Editar Produto';
    document.getElementById('produtoId').value = produto.id;
    document.getElementById('produtoNome').value = produto.name;
    document.getElementById('produtoPreco').value = produto.price;
    document.getElementById('produtoDisponivel').checked = produto.available;
    document.getElementById('produtosLojaSelect').value = produto.storeId;
    document.getElementById('produtoMensagem').textContent = '';
    document.getElementById('produtoForm')?.classList.remove('hidden');
}

function abrirNovoProduto() {
    carregarSelecaoLojasProdutos();
    document.getElementById('produtoFormTitle').textContent = 'Novo Produto';
    document.getElementById('produtoId').value = '';
    document.getElementById('produtoNome').value = '';
    document.getElementById('produtoPreco').value = '';
    document.getElementById('produtoDisponivel').checked = true;
    document.getElementById('produtoMensagem').textContent = '';
    document.getElementById('produtoForm')?.classList.remove('hidden');
}

function fecharFormProduto() {
    document.getElementById('produtoForm')?.classList.add('hidden');
    document.getElementById('produtoMensagem').textContent = '';
}

function salvarProdutoEdicao(event) {
    event.preventDefault();

    const id = Number(document.getElementById('produtoId').value);
    const nome = document.getElementById('produtoNome').value.trim();
    const preco = Number(document.getElementById('produtoPreco').value);
    const disponivel = document.getElementById('produtoDisponivel').checked;
    const lojaId = Number(document.getElementById('produtosLojaSelect').value);
    const mensagem = document.getElementById('produtoMensagem');

    mensagem.textContent = '';

    if (nome.length < 3) {
        mensagem.textContent = 'O nome do produto deve ter pelo menos 3 caracteres.';
        return;
    }

    if (isNaN(preco) || preco < 0) {
        mensagem.textContent = 'Preço inválido.';
        return;
    }

    const existente = products.find(p => p.name.toLowerCase() === nome.toLowerCase() && p.id !== id && p.storeId === lojaId);
    if (existente) {
        mensagem.textContent = 'Já existe outro produto com esse nome nesta loja.';
        return;
    }

    if (id) {
        const produto = products.find(p => p.id === id);
        if (!produto) {
            mensagem.textContent = 'Produto não encontrado.';
            return;
        }
        produto.name = nome;
        produto.price = preco;
        produto.available = disponivel;
        produto.storeId = lojaId;
    } else {
        const novoId = Math.max(...products.map(p => p.id), 0) + 1;
        products.push({ id: novoId, name: nome, price: preco, available: disponivel, storeId: lojaId });
    }

    if (typeof salvarProdutosNoStorage === 'function') {
        salvarProdutosNoStorage(products);
    }

    fecharFormProduto();
    renderizarProdutos();
    atualizarDashboard();
}

function excluirProduto(produtoId) {
    const produto = products.find(p => p.id === produtoId);
    if (!produto) return;

    if (!confirm(`Deseja excluir o produto ${produto.name}?`)) {
        return;
    }

    const index = products.findIndex(p => p.id === produtoId);
    if (index >= 0) {
        products.splice(index, 1);
        if (typeof salvarProdutosNoStorage === 'function') {
            salvarProdutosNoStorage(products);
        }
        renderizarProdutos();
        atualizarDashboard();
    }
}

// Função para atualizar o Dashboard
async function atualizarDashboard() {
    await aguardarDadosCarregados();

    // Contar usuários
    const totalUsuarios = users.length;
    document.getElementById('totalUsuarios').textContent = totalUsuarios;

    // Contar lojas
    const totalLojas = stores.length;
    document.getElementById('totalLojas').textContent = totalLojas;

    // Contar produtos
    const totalProdutos = products.length;
    document.getElementById('totalProdutos').textContent = totalProdutos;

    // Contar pedidos
    const totalPedidos = orders.length;
    document.getElementById('totalPedidos').textContent = totalPedidos;

    // Atualizar gráficos
    atualizarUsuariosPorTipo();
    atualizarPedidosPorStatus();
}

function atualizarUsuariosPorTipo() {
    const container = document.getElementById('usuariosPorTipo');

    // Contar usuários por tipo
    const tipos = {};
    users.forEach(user => {
        tipos[user.type] = (tipos[user.type] || 0) + 1;
    });

    // Criar HTML com as informações
    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';

    for (const [tipo, count] of Object.entries(tipos)) {
        const porcentagem = ((count / users.length) * 100).toFixed(1);
        const tipoFormatado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        html += `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="min-width: 100px;">${tipoFormatado}:</span>
                <div style="background: #f0f0f0; height: 20px; flex: 1; border-radius: 5px; overflow: hidden;">
                    <div style="background: #ff3c00; height: 100%; width: ${porcentagem}%; transition: width 0.3s;"></div>
                </div>
                <span style="min-width: 60px; text-align: right;">${count} (${porcentagem}%)</span>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function atualizarPedidosPorStatus() {
    const container = document.getElementById('pedidosPorStatus');

    // Contar pedidos por status
    const status = {};
    orders.forEach(order => {
        status[order.status] = (status[order.status] || 0) + 1;
    });

    // Criar HTML com as informações
    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';

    for (const [stat, count] of Object.entries(status)) {
        const porcentagem = ((count / orders.length) * 100).toFixed(1);
        const statusFormatado = stat.charAt(0).toUpperCase() + stat.slice(1);
        html += `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="min-width: 100px;">${statusFormatado}:</span>
                <div style="background: #f0f0f0; height: 20px; flex: 1; border-radius: 5px; overflow: hidden;">
                    <div style="background: #f7931e; height: 100%; width: ${porcentagem}%; transition: width 0.3s;"></div>
                </div>
                <span style="min-width: 60px; text-align: right;">${count} (${porcentagem}%)</span>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function resetarDadosSistema() {
    if (confirm('Tem certeza que deseja resetar todos os dados? Isso irá restaurar os dados originais do JSON e remover todas as alterações salvas.')) {
        resetarDados();
        alert('Dados resetados com sucesso! Recarregue a página para ver as mudanças.');
    }
}