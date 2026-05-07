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

    atualizarBemVindo();
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