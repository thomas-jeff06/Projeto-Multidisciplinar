/**
 * Utilitário de Armazenamento
 * Gerencia localStorage da aplicação
 */

const StorageKeys = {
    CURRENT_USER: 'currentUser',
    LGPD_ACEITO: 'lgpdAceito'
};

function salvarUsuario(user) {
    localStorage.setItem(StorageKeys.CURRENT_USER, JSON.stringify(user));
}

function obterUsuario() {
    const userJSON = localStorage.getItem(StorageKeys.CURRENT_USER);
    return userJSON ? JSON.parse(userJSON) : null;
}

function limparUsuario() {
    localStorage.removeItem(StorageKeys.CURRENT_USER);
}

function aceitarLGPD() {
    localStorage.setItem(StorageKeys.LGPD_ACEITO, 'true');
}

function lgpdAceito() {
    return localStorage.getItem(StorageKeys.LGPD_ACEITO) === 'true';
}

function limpar() {
    localStorage.clear();
}