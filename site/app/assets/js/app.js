// =========================
//  TEMA — aplica ANTES do paint
// =========================
(function () {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
})();

// =========================
//  PROTEÇÃO DE LOGIN
// =========================
if (localStorage.getItem('logado') !== 'true') {
    window.location.href = `${BASE_URL}/site/public/pages/index.html`;
}

// =========================
//  USUÁRIO LOGADO
// =========================
const emailLogado    = localStorage.getItem('usuarioAtual');
const elementoUsuario = document.getElementById('usuario');
if (emailLogado && elementoUsuario) {
    elementoUsuario.innerText = 'Logado como: ' + emailLogado;
}

// =========================
//  LOGOUT
// =========================

const BASE_URL = window.location.origin + "/GeTech";


function logout() {
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');
    window.location.href = `${BASE_URL}/site/public/pages/index.html`;
}

// =========================
//  NAVEGAÇÃO PARA MÓDULOS
// =========================
function abrirModulo(nome) {
    window.location.href = 'modules/' + nome + '/' + nome + '.html';
}

// =========================
//  TOGGLE DE TEMA
// =========================
function inicializarToggleTema() {
    const btn  = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!btn) return;

    const aplicarTema = (tema) => {
        document.documentElement.setAttribute('data-theme', tema);
        localStorage.setItem('theme', tema);
        if (icon) icon.textContent = tema === 'dark' ? '🌙' : '☀️';
        btn.setAttribute('aria-label', tema === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    };

    aplicarTema(localStorage.getItem('theme') || 'dark');

    btn.addEventListener('click', () => {
        const atual = document.documentElement.getAttribute('data-theme');
        aplicarTema(atual === 'dark' ? 'light' : 'dark');
    });
}

document.addEventListener('DOMContentLoaded', inicializarToggleTema);