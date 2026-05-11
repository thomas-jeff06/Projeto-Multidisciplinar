/**
 * Cliente Page Script
 * Funcionalidades específicas para clientes
 */

let carrinho = [];
let pontos = 0;
let produtos = [];
let currentUser = null;
let selectedStore = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = obterUsuario();

    if (!currentUser || currentUser.type !== 'cliente') {
        window.location.href = '../index.html';
        return;
    }

    // Carregar dados
    await carregarDados();

    // Atualizar interface
    atualizarBemVindo();
    carregarPontos();
    mostrarUnidades();
});

function atualizarBemVindo() {
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl && currentUser) {
        const tipo = currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1);
        welcomeEl.textContent = `Bem-vindo ${tipo}`;
    }
}

function carregarPontos() {
    const userLoyalty = obterLealdadePorUsuario(currentUser.id);
    pontos = userLoyalty ? userLoyalty.pontos : 0;
    document.getElementById("pontos").textContent = pontos;
}

function mostrarUnidades() {
    const container = document.getElementById("unidades");
    container.innerHTML = "";

    stores.forEach(store => {
        const card = document.createElement("div");
        card.className = "store-card";
        card.innerHTML = `
            <h3>${store.name}</h3>
            <p>${store.description || 'Veja o cardápio desta lanchonete'}</p>
        `;
        card.addEventListener('click', () => selecionarUnidade(store.id, card));
        container.appendChild(card);
    });
}

function selecionarUnidade(storeId, cardElement) {
    selectedStore = stores.find(s => s.id === storeId);
    if (!selectedStore) return;

    document.querySelectorAll('.store-card').forEach(card => card.classList.remove('selected'));
    if (cardElement) cardElement.classList.add('selected');

    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
        welcomeEl.textContent = `Bem-vindo ${currentUser.username}! Cardápio da ${selectedStore.name}`;
    }

    document.getElementById('unidades').classList.add('hidden');
    document.getElementById('cardapio').classList.remove('hidden');
    document.getElementById('voltarUnidades').classList.remove('hidden');
    produtos = obterProdutosPorLoja(selectedStore.id);
    carregarProdutos();
}

function voltarParaUnidades() {
    selectedStore = null;
    document.getElementById('unidades').classList.remove('hidden');
    document.getElementById('cardapio').classList.add('hidden');
    document.getElementById('voltarUnidades').classList.add('hidden');
    document.getElementById('produtos').innerHTML = '';
    carrinho = [];
    atualizarCarrinho();
    document.getElementById('pagamento').classList.add('hidden');
    document.getElementById('status').classList.add('hidden');

    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
        welcomeEl.textContent = `Bem-vindo ${currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1)}`;
    }
}

function carregarProdutos() {
    const div = document.getElementById("produtos");
    div.innerHTML = "";

    if (!selectedStore) {
        div.innerHTML = '<p>Escolha uma lanchonete para ver os produtos.</p>';
        return;
    }

    if (produtos.length === 0) {
        div.innerHTML = '<p>Nenhum produto disponível nesta lanchonete.</p>';
        return;
    }

    produtos.forEach((p, index) => {
        const item = document.createElement("div");
        item.className = "produto-card";
        item.innerHTML = `
            <h3>${p.name}</h3>
            <p>R$ ${p.price}</p>
            <button onclick="adicionarAoCarrinho(${index})">Adicionar</button>
        `;
        div.appendChild(item);
    });
}

function adicionarAoCarrinho(index) {
    carrinho.push(produtos[index]);
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const lista = document.getElementById("listaCarrinho");
    const totalSpan = document.getElementById("total");

    lista.innerHTML = "";
    let total = 0;

    if (carrinho.length === 0) {
        const li = document.createElement("li");
        li.textContent = 'Carrinho vazio';
        lista.appendChild(li);
        totalSpan.textContent = '0.00';
        return;
    }

    carrinho.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = 'cart-item';
        li.innerHTML = `
            <span>${item.name} - R$ ${item.price.toFixed(2)}</span>
            <button type="button" class="btn-remove" onclick="removerDoCarrinho(${index})">Remover</button>
        `;
        lista.appendChild(li);
        total += item.price;
    });

    totalSpan.textContent = total.toFixed(2);
}

function removerDoCarrinho(index) {
    if (index < 0 || index >= carrinho.length) return;
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert("Carrinho vazio!");
        return;
    }

    pontos += 10;
    document.getElementById("pontos").textContent = pontos;

    const userLoyalty = obterLealdadePorUsuario(currentUser.id);
    if (userLoyalty) {
        userLoyalty.pontos = pontos;
        if (pontos >= 100) userLoyalty.nivel = "ouro";
        else if (pontos >= 50) userLoyalty.nivel = "prata";
        else userLoyalty.nivel = "bronze";
    }

    document.getElementById("pagamento").classList.remove("hidden");
}

function pagar() {
    if (!selectedStore) {
        alert("Selecione uma lanchonete antes de pagar.");
        return;
    }

    const status = document.getElementById("statusPagamento");
    status.textContent = "Processando...";

    setTimeout(() => {
        const sucesso = Math.random() > 0.3;

        if (sucesso) {
            status.textContent = "Pagamento aprovado!";
            criarPedido(
                currentUser.id,
                selectedStore.id,
                carrinho.map(p => ({ id: p.id, name: p.name, price: p.price })),
                parseFloat(document.getElementById("total").textContent)
            );
            carrinho = [];
            atualizarCarrinho();
            mostrarStatusPedido();
        } else {
            status.textContent = "Pagamento recusado!";
        }
    }, 2000);
}

function mostrarStatusPedido() {
    document.getElementById("status").classList.remove("hidden");

    setTimeout(() => {
        document.getElementById("statusPedido").textContent = "Em preparo...";
    }, 2000);

    setTimeout(() => {
        document.getElementById("statusPedido").textContent = "Pronto para retirada!";
    }, 5000);
}

function sair() {
    fazerLogout();
    window.location.href = '../index.html';
}