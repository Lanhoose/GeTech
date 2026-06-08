// ==========================================================================
//  1. CONFIGURAÇÕES INICIAIS E BASE URL (Definidas no topo para evitar erros)
// ==========================================================================
const BASE_URL = window.location.origin + "/GeTech";

// ==========================================================================
//  2. TEMA — Aplica ANTES do paint (Evita o flash branco)
// ==========================================================================
(function () {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
})();

// ==========================================================================
//  3. PROTEÇÃO DE TELA / LOGIN
// ==========================================================================
if (localStorage.getItem('logado') !== 'true') {
    window.location.href = `${BASE_URL}/site/public/pages/index.html`;
}

// ==========================================================================
//  4. TRATAMENTO DO USUÁRIO LOGADO (Exibe apenas o que vem antes do @)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const emailLogado = localStorage.getItem('usuarioAtual');
    const elementoUsuario = document.getElementById('usuario');

    if (emailLogado && elementoUsuario) {
        // Separa o e-mail no '@' e pega apenas a primeira parte (índice 0)
        const nomeUsuario = emailLogado.split('@')[0];
        
        // Formata a primeira letra em maiúscula para ficar mais elegante (opcional, mas recomendado)
        const nomeFormatado = nomeUsuario.charAt(0).toUpperCase() + nomeUsuario.slice(1);
        
        elementoUsuario.innerText = `Bem-vindo, ${nomeFormatado}!`;
    }
});

// ==========================================================================
//  5. LOGOUT
// ==========================================================================
function logout() {
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');
    window.location.href = `${BASE_URL}/site/public/pages/index.html`;
}

// ==========================================================================
//  6. NAVEGAÇÃO PARA MÓDULOS
// ==========================================================================
function abrirModulo(nome) {
    window.location.href = 'modules/' + nome + '/' + nome + '.html';
}

// ==========================================================================
//  7. TOGGLE DE TEMA (SINCRONIZADO)
// ==========================================================================
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

    // Inicializa com o tema salvo
    aplicarTema(localStorage.getItem('theme') || 'dark');

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        aplicarTema(current === 'dark' ? 'light' : 'dark');
    });
}

// Inicializa o escutador do botão de tema ao carregar a página
document.addEventListener('DOMContentLoaded', inicializarToggleTema);