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

async function carregarDados() {
    try {
        const currentUrl = new URL(location.href);
        const currentDir = currentUrl.pathname.replace(/\/[^/]*$/, '/');
        const dataPath = currentDir.endsWith('/pages/') ? '../data/' : 'data/';
        const dataBaseUrl = new URL(dataPath, currentUrl);
        console.log('Carregando dados de:', dataBaseUrl.href);
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
        loyalty = await loyaltyRes.json();

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

function obterUsuarioPorId(userId) {
    return users.find(u => u.id === userId);
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