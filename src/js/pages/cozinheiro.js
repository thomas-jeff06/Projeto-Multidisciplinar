/**
 * Cozinheiro Page Script
 * Funcionalidades específicas para cozinheiros
 */

let currentUser = null;

const statusMap = {
    pendente: '📝 Pendente',
    preparando: '⏳ Em Preparação',
    pronto: '✅ Pronto'
};

const statusFlow = {
    pendente: 'preparando',
    preparando: 'pronto',
    pronto: 'pronto'
};

const statusLabels = {
    pendente: 'Preparando',
    preparando: 'Pronto',
    pronto: 'Finalizado'
};

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isFunction = fn => typeof fn === 'function';

if (isBrowser) {
    console.log('Script do cozinheiro carregado no navegador');

    window.addEventListener('load', async () => {
        console.log('Página totalmente carregada, verificando funções...');

        if (isFunction(carregarDados)) {
            await carregarDados();
        }

        if (arePageFunctionsAvailable()) {
            console.log('Todas as funções encontradas, inicializando...');
            inicializar();
        } else {
            logMissingPageFunctions();
        }
    });
}

function arePageFunctionsAvailable() {
    return isFunction(obterUsuario) &&
        isFunction(atualizarBemVindo) &&
        isFunction(carregarPedidosTabela);
}

function logMissingPageFunctions() {
    console.error('Funções necessárias não encontradas. Verificando disponibilidade:');
    console.log('obterUsuario:', typeof obterUsuario);
    console.log('atualizarBemVindo:', typeof atualizarBemVindo);
    console.log('carregarPedidosTabela:', typeof carregarPedidosTabela);
}

function inicializar() {
    console.log('Inicializando aplicação do cozinheiro...');

    if (!isFunction(obterUsuario)) {
        console.error('Função obterUsuario não encontrada');
        return;
    }

    currentUser = obterUsuario();
    console.log('Usuário atual:', currentUser);

    if (!isCozinheiroValido()) {
        return redirectToLogin();
    }

    atualizarBemVindo();
    carregarPedidosTabela();
}

function isCozinheiroValido() {
    return currentUser && currentUser.type === 'cozinheiro';
}

function redirectToLogin() {
    console.log('Usuário não é cozinheiro, redirecionando...');
    if (isBrowser && window.location) {
        window.location.href = '../index.html';
    }
}

function atualizarBemVindo() {
    const welcomeEl = document.getElementById('welcomeMessage');
    if (!welcomeEl || !currentUser) return;

    const tipo = currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1);
    const loja = currentUser.storeId ? obterLojaPorId(currentUser.storeId) : null;
    const nomeLoja = loja ? ` - ${loja.name}` : '';

    welcomeEl.textContent = `Bem-vindo ${tipo}${nomeLoja}`;
}

function sair() {
    fazerLogout();
    window.location.href = '../index.html';
}

function carregarPedidosTabela() {
    const orders = obterPedidos();
    console.log('Pedidos carregados para tabela:', orders);

    const pedidosFiltrados = filterPedidosPorLoja(orders);
    preencherTabelaPedidos(pedidosFiltrados);
}

function filterPedidosPorLoja(orders) {
    if (!currentUser || !currentUser.storeId) return orders;
    return orders.filter(o => o.storeId === currentUser.storeId);
}

function preencherTabelaPedidos(orders) {
    const tbody = document.getElementById('pedidos-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!orders.length) {
        tbody.innerHTML = renderNoOrdersRow();
        return;
    }

    orders.forEach(order => tbody.appendChild(createOrderRow(order)));
}

function renderNoOrdersRow() {
    return '<tr><td colspan="6" style="text-align: center; color: #999; padding: 20px;">Nenhum pedido encontrado</td></tr>';
}

function createOrderRow(order) {
    const usuario = obterUsuarioPorId(order.userId);
    const nomeUsuario = usuario ? usuario.username : `Usuário ${order.userId}`;
    const itensTexto = order.itens.map(formatOrderItem).join(', ');
    const statusFormatado = formatarStatus(order.status);
    const statusClass = `status-${order.status}`;
    const proximoStatus = getNextStatus(order.status);
    const labelBotao = getNextStatusLabel(order.status);

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><strong>#${order.id}</strong></td>
        <td>${nomeUsuario}</td>
        <td>${itensTexto}</td>
        <td>R$ ${order.total.toFixed(2)}</td>
        <td><span class="status-badge ${statusClass}">${statusFormatado}</span></td>
        <td>${renderOrderAction(order.status, order.id, proximoStatus, labelBotao)}</td>
    `;

    return tr;
}

function formatOrderItem(item) {
    const produto = obterProdutoPorId(item.id);
    const nome = produto ? produto.name : `Produto ${item.id}`;
    return `${item.quantity}x ${nome}`;
}

function renderOrderAction(status, orderId, proximoStatus, labelBotao) {
    if (status === 'pronto') {
        return '<span style="color: #999;">Finalizado</span>';
    }
    return `<button class="btn-status" onclick="alterarStatusPedido(${orderId}, '${proximoStatus}')">→ ${labelBotao}</button>`;
}

function formatarStatus(status) {
    return statusMap[status] || status;
}

function getNextStatus(currentStatus) {
    return statusFlow[currentStatus] || currentStatus;
}

function getNextStatusLabel(currentStatus) {
    return statusLabels[currentStatus] || currentStatus;
}

function alterarStatusPedido(orderId, novoStatus) {
    const orders = obterPedidos();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = novoStatus;
    salvarPedidos(orders);
    carregarPedidosTabela();
}
