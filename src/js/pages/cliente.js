/**
 * Cliente Page Script
 * Funcionalidades específicas para clientes
 */

let carrinho = [];
let pontos = 0;
let produtos = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = obterUsuario();

    if (!currentUser || currentUser.type !== 'cliente') {
        window.location.href = '../index.html';
        return;
    }

    // Carregar dados
    carregarDados();

    // Atualizar interface
    atualizarBemVindo();
    carregarPontos();
    mudarUnidade();
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

function mudarUnidade() {
    const select = document.getElementById("unidadeSelect");
    const storeName = select.value;
    const store = stores.find(s => s.name === storeName);
    if (store) {
        produtos = obterProdutosPorLoja(store.id);
    }
    carregarProdutos();
}

function carregarProdutos() {
    const div = document.getElementById("produtos");
    div.innerHTML = "";

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

    carrinho.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.name;
        lista.appendChild(li);
        total += item.price;
    });

    totalSpan.textContent = total;
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
    const status = document.getElementById("statusPagamento");
    status.textContent = "Processando...";

    setTimeout(() => {
        const sucesso = Math.random() > 0.3;

        if (sucesso) {
            status.textContent = "Pagamento aprovado!";
            const store = stores.find(s => s.name === document.getElementById("unidadeSelect").value);
            criarPedido(
                currentUser.id,
                store.id,
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