/**
 * Cozinheiro Page Script
 * Funcionalidades específicas para cozinheiros
 */

let currentUser = null;

// Verificar se estamos no navegador
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    console.log('Script do cozinheiro carregado no navegador');

    // Aguardar que todos os scripts sejam carregados
    window.addEventListener('load', async function () {
        console.log('Página totalmente carregada, verificando funções...');

        // Carregar dados antes de usar pedidos
        if (typeof carregarDados === 'function') {
            await carregarDados();
        }

        // Verificar se as funções necessárias existem
        if (typeof obterUsuario === 'function' &&
            typeof atualizarBemVindo === 'function' &&
            typeof carregarPedidosTabela === 'function') {
            console.log('Todas as funções encontradas, inicializando...');
            inicializar();
        } else {
            console.error('Funções necessárias não encontradas. Verificando disponibilidade:');
            console.log('obterUsuario:', typeof obterUsuario);
            console.log('atualizarBemVindo:', typeof atualizarBemVindo);
            console.log('carregarPedidosTabela:', typeof carregarPedidosTabela);
        }
    });
}

function inicializar() {
    console.log('Inicializando aplicação do cozinheiro...');
    try {
        // Verificar se as funções necessárias existem
        if (typeof obterUsuario !== 'function') {
            console.error('Função obterUsuario não encontrada');
            return;
        }

        currentUser = obterUsuario();
        console.log('Usuário atual:', currentUser);

        if (!currentUser || currentUser.type !== 'cozinheiro') {
            console.log('Usuário não é cozinheiro, redirecionando...');
            if (typeof window !== 'undefined' && window.location) {
                window.location.href = '../index.html';
            }
            return;
        }

        console.log('Carregando interface...');

        // Verificar se as funções de interface existem
        if (typeof atualizarBemVindo === 'function') {
            atualizarBemVindo();
        } else {
            console.warn('Função atualizarBemVindo não encontrada');
        }

        if (typeof carregarPedidosTabela === 'function') {
            carregarPedidosTabela();
        } else {
            console.warn('Função carregarPedidosTabela não encontrada');
        }

    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
}

function atualizarBemVindo() {
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl && currentUser) {
        const tipo = currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1);
        const loja = currentUser.storeId ? obterLojaPorId(currentUser.storeId) : null;
        const nomeLoja = loja ? ` - ${loja.name}` : '';
        welcomeEl.textContent = `Bem-vindo ${tipo}${nomeLoja}`;
    }
}

function sair() {
    fazerLogout();
    window.location.href = '../index.html';
}

function carregarPedidosTabela() {
    const orders = obterPedidos();

    console.log('Pedidos carregados para tabela:', orders);

    // Filtrar pedidos apenas da loja do cozinheiro
    let pedidosFiltrados = orders;
    if (currentUser && currentUser.storeId) {
        pedidosFiltrados = orders.filter(o => o.storeId === currentUser.storeId);
    }

    preencherTabelaPedidos(pedidosFiltrados);
}

function preencherTabelaPedidos(orders) {
    const tbody = document.getElementById('pedidos-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999; padding: 20px;">Nenhum pedido encontrado</td></tr>';
        return;
    }

    orders.forEach(order => {
        const usuario = obterUsuarioPorId(order.userId);
        const nomeUsuario = usuario ? usuario.username : `Usuário ${order.userId}`;

        const itensTexto = order.itens.map(item => {
            const produto = obterProdutoPorId(item.id);
            const nome = produto ? produto.name : `Produto ${item.id}`;
            return `${item.quantity}x ${nome}`;
        }).join(', ');

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
            <td>
                ${order.status !== 'pronto' ? `<button class="btn-status" onclick="alterarStatusPedido(${order.id}, '${proximoStatus}')">→ ${labelBotao}</button>` : '<span style="color: #999;">Finalizado</span>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function formatarStatus(status) {
    const statusMap = {
        'pendente': '📝 Pendente',
        'preparando': '⏳ Em Preparação',
        'pronto': '✅ Pronto'
    };
    return statusMap[status] || status;
}

function getNextStatus(currentStatus) {
    const flow = {
        'pendente': 'preparando',
        'preparando': 'pronto',
        'pronto': 'pronto'
    };
    return flow[currentStatus] || currentStatus;
}

function getNextStatusLabel(currentStatus) {
    const labels = {
        'pendente': 'Preparando',
        'preparando': 'Pronto',
        'pronto': 'Finalizado'
    };
    return labels[currentStatus] || currentStatus;
}

function alterarStatusPedido(orderId, novoStatus) {
    const orders = obterPedidos();
    const order = orders.find(o => o.id === orderId);

    if (order) {
        order.status = novoStatus;
        salvarPedidos(orders);
        carregarPedidosTabela(); // Recarregar tabela
    }
}