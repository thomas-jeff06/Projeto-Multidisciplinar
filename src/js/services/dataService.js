/**
 * Serviço de Dados
 * Responsável por carregar e gerenciar dados das APIs/JSONs
 */

let stores = [];
var users = [];
let products = [];
let orders = [];
let loyalty = [];
let dadosCarregados = false;

console.log('Iniciando carregamento de dados...');


async function carregarDados() {
    try {
        console.log('Carregando dados das APIs/JSONs...');
        const currentUrl = new URL(location.href);
        const currentDir = currentUrl.pathname.replace(/\/[^/]*$/, '/');
        const dataPath = currentDir.endsWith('/pages/') ? '../data/' : 'data/';
        const dataBaseUrl = new URL(dataPath, currentUrl);
        const [storesRes, usersRes, productsRes, ordersRes, loyaltyRes] = await Promise.all([
            fetch(new URL('store.json', dataBaseUrl)),
            fetch(new URL('usuarios.json', dataBaseUrl)),
            fetch(new URL('produtos.json', dataBaseUrl)),
            fetch(new URL('order.json', dataBaseUrl)),
            fetch(new URL('loyalty.json', dataBaseUrl))
        ]);

        stores = await storesRes.json();
        users = await usersRes.json();
        products = await productsRes.json();
        orders = await ordersRes.json();
        console.log('Dados originais carregados:', { orders });
        loyalty = await loyaltyRes.json();

        // Carregar dados salvos em localStorage
        const storesSalvos = localStorage.getItem('stores_backup');
        if (storesSalvos) {
            stores = JSON.parse(storesSalvos);
            console.log('Lojas carregadas do localStorage');
        }

        const usuariosSalvos = localStorage.getItem('usuarios_backup');
        if (usuariosSalvos) {
            users = JSON.parse(usuariosSalvos);
            console.log('Usuários carregados do localStorage');
        }

        const produtosSalvos = localStorage.getItem('produtos_backup');
        if (produtosSalvos) {
            products = JSON.parse(produtosSalvos);
            console.log('Produtos carregados do localStorage');
        }

        const pedidosSalvos = localStorage.getItem('orders_backup');
        if (pedidosSalvos) {
            orders = JSON.parse(pedidosSalvos);
            console.log('Pedidos carregados do localStorage');
        }

        console.log('Dados carregados com sucesso');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    } finally {
        dadosCarregados = true;
    }
}

function aguardarDadosCarregados() {
    return new Promise((resolve) => {
        if (dadosCarregados) {
            resolve();
        } else {
            const checkLoaded = () => {
                if (dadosCarregados) {
                    resolve();
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            checkLoaded();
        }
    });
}

function obterProdutosPorLoja(storeId) {
    return products.filter(p => p.storeId === storeId && p.available);
}

function obterLojaPorId(storeId) {
    return stores.find(s => s.id === storeId);
}

function obterUsuarioPorId(userId) {
    return users.find(u => u.id === userId);
}

function obterProdutoPorId(productId) {
    return products.find(p => p.id === productId);
}

function obterLealdadePorUsuario(userId) {
    return loyalty.find(l => l.userId === userId);
}

function criarPedido(userId, storeId, itens, total) {
    const newOrder = {
        id: orders.length + 1,
        userId: userId,
        storeId: storeId,
        itens: itens,
        total: total,
        status: "pendente",
        data: new Date().toISOString()
    };
    orders.push(newOrder);
    return newOrder;
}

function salvarStoresNoStorage(storesArray) {
    localStorage.setItem('stores_backup', JSON.stringify(storesArray));
    console.log('Lojas salvas em localStorage');
}

function salvarProdutosNoStorage(produtosArray) {
    localStorage.setItem('produtos_backup', JSON.stringify(produtosArray));
    console.log('Produtos salvos em localStorage');
}

function obterPedidos() {
    console.log('Obtendo pedidos atuais:', orders);
    return orders;
}

function salvarPedidos(ordersArray) {
    orders = ordersArray;
    localStorage.setItem('orders_backup', JSON.stringify(ordersArray));
    console.log('Pedidos salvos em localStorage');
}

function resetarDados() {
    // Limpar localStorage
    localStorage.removeItem('stores_backup');
    localStorage.removeItem('usuarios_backup');
    localStorage.removeItem('produtos_backup');
    localStorage.removeItem('orders_backup');
    console.log('Dados do localStorage resetados');

    // Recarregar dados originais
    dadosCarregados = false;
    carregarDados();
}