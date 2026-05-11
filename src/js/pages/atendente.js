/**
 * Atendente Page Script
 * Funcionalidades espec�ficas para atendentes
 */

let currentUser = null;
let cart = [];
let produtos = [];

const statusMap = {
    pendente: '📝 Pendente',
    preparando: '⏳ Em Preparação',
    pronto: '✅ Pronto'
};

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isFunction = fn => typeof fn === 'function';

if (isBrowser) {
    window.addEventListener('load', async () => {
        if (isFunction(carregarDados)) {
            await carregarDados();
        }

        currentUser = obterUsuario();
        if (!isAtendenteValido()) {
            window.location.href = '../index.html';
            return;
        }

        atualizarBemVindo();
        configurarTabs();
        carregarProdutos();
        mostrarSecao('novoPedido');
    });
}

function isAtendenteValido() {
    return currentUser && currentUser.type === 'atendente';
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

function configurarTabs() {
    const tabs = {
        novoPedido: document.getElementById('tabNovoPedido'),
        pedidosAtivos: document.getElementById('tabPedidosAtivos'),
        retirada: document.getElementById('tabRetirada')
    };

    tabs.novoPedido.addEventListener('click', () => mostrarSecao('novoPedido'));
    tabs.pedidosAtivos.addEventListener('click', () => mostrarSecao('pedidosAtivos'));
    tabs.retirada.addEventListener('click', () => mostrarSecao('retirada'));
}

function mostrarSecao(secao) {
    const sections = {
        novoPedido: document.getElementById('novoPedidoSection'),
        pedidosAtivos: document.getElementById('pedidosAtivosSection'),
        retirada: document.getElementById('retiradaSection')
    };

    const tabs = {
        novoPedido: document.getElementById('tabNovoPedido'),
        pedidosAtivos: document.getElementById('tabPedidosAtivos'),
        retirada: document.getElementById('tabRetirada')
    };

    Object.values(sections).forEach(section => section.classList.add('hidden'));
    Object.values(tabs).forEach(tab => tab.classList.remove('active'));

    if (sections[secao]) sections[secao].classList.remove('hidden');
    if (tabs[secao]) tabs[secao].classList.add('active');

    if (secao === 'novoPedido') {
        renderizarProdutos();
        atualizarCarrinho();
    } else if (secao === 'pedidosAtivos') {
        renderizarPedidos('pedidos-ativos-tbody', ['pendente', 'preparando']);
    } else if (secao === 'retirada') {
        renderizarPedidos('pedidos-retirada-tbody', ['pronto']);
    }
}

function carregarProdutos() {
    produtos = obterProdutosPorLoja(currentUser.storeId);
    renderizarProdutos();
}

function renderizarProdutos() {
    const container = document.getElementById('produtos');
    if (!container) return;

    container.innerHTML = '';
    if (!produtos || produtos.length === 0) {
        container.innerHTML = '<p>Nenhum produto disponível nesta loja.</p>';
        return;
    }

    produtos.forEach((produto, index) => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <h4>${produto.name}</h4>
            <p>R$ ${produto.price.toFixed(2)}</p>
            <button type="button">Adicionar</button>
        `;

        const button = card.querySelector('button');
        button.addEventListener('click', () => adicionarAoCarrinho(index));
        container.appendChild(card);
    });
}

function adicionarAoCarrinho(index) {
    cart.push(produtos[index]);
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const lista = document.getElementById('listaCarrinho');
    const totalSpan = document.getElementById('total');
    if (!lista || !totalSpan) return;

    const itens = agruparCarrinho();
    lista.innerHTML = '';
    let total = 0;

    if (itens.length === 0) {
        lista.innerHTML = '<li>Carrinho vazio</li>';
        totalSpan.textContent = '0.00';
        return;
    }

    itens.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <span>${item.quantity}x ${item.name} - R$ ${item.price.toFixed(2)}</span>
            <button type="button" class="btn-remove" data-product-id="${item.id}">Remover</button>
        `;

        const removeButton = li.querySelector('.btn-remove');
        removeButton.addEventListener('click', () => removerDoCarrinho(item.id));

        lista.appendChild(li);
        total += item.price * item.quantity;
    });

    totalSpan.textContent = total.toFixed(2);
}

function agruparCarrinho() {
    return cart.reduce((acc, produto) => {
        const existente = acc.find(item => item.id === produto.id);
        if (existente) {
            existente.quantity += 1;
        } else {
            acc.push({ id: produto.id, name: produto.name, price: produto.price, quantity: 1 });
        }
        return acc;
    }, []);
}
function removerDoCarrinho(produtoId) {
    cart = cart.filter(item => item.id !== produtoId);
    atualizarCarrinho();
}
function finalizarPedido() {
    const itens = agruparCarrinho().map(item => ({ id: item.id, quantity: item.quantity }));
    if (itens.length === 0) {
        alert('Adicione produtos ao carrinho antes de finalizar o pedido.');
        return;
    }

    const total = itens.reduce((sum, item) => {
        const produto = obterProdutoPorId(item.id);
        return sum + (produto ? produto.price * item.quantity : 0);
    }, 0);

    criarPedido(currentUser.id, currentUser.storeId, itens, total);
    salvarPedidos(obterPedidos());

    cart = [];
    atualizarCarrinho();
    alert('Pedido criado com sucesso!');
}

function renderizarPedidos(tbodyId, statusFiltro) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const pedidos = obterPedidos()
        .filter(order => order.storeId === currentUser.storeId)
        .filter(order => statusFiltro.includes(order.status));

    tbody.innerHTML = '';
    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999; padding: 20px;">Nenhum pedido encontrado</td></tr>';
        return;
    }

    pedidos.forEach(order => tbody.appendChild(criarLinhaPedido(order)));
}

function criarLinhaPedido(order) {
    const usuario = obterUsuarioPorId(order.userId);
    const nomeUsuario = usuario ? usuario.username : `Usuário ${order.userId}`;
    const itensTexto = order.itens.map(item => {
        const produto = obterProdutoPorId(item.id);
        const nome = produto ? produto.name : `Produto ${item.id}`;
        return `${item.quantity}x ${nome}`;
    }).join(', ');

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><strong>#${order.id}</strong></td>
        <td>${nomeUsuario}</td>
        <td>${itensTexto}</td>
        <td>R$ ${order.total.toFixed(2)}</td>
        <td><span class="status-badge status-${order.status}">${formatarStatus(order.status)}</span></td>
    `;

    return tr;
}

function formatarStatus(status) {
    return statusMap[status] || status;
}
