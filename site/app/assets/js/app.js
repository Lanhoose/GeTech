// ==========================================================================
//  1. CONFIGURAÇÕES INICIAIS E BASE URL
// ==========================================================================
window.BASE_URL = window.location.origin + "/GeTech/site";

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
    window.location.href = `${window.BASE_URL}/public/pages/index.html`;
}

// ==========================================================================
//  4. CAPTURA E EXIBIÇÃO DO NOME DO USUÁRIO LOGADO (Estilo login.js)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Pega o elemento na tela (Trata tanto id="usuario" quanto id=\"usuario\")
    const elementoUsuario = document.getElementById('usuario') || document.querySelector('[id*="usuario"]');
    const emailLogado = localStorage.getItem('usuarioAtual');

    if (emailLogado && elementoUsuario) {
        // 2. Busca a lista unificada de usuários, igualzinho ao seu login.js
        const listaUsuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        
        // 3. Procura pelo objeto do usuário atual
        const usuarioEncontrado = listaUsuarios.find(u => u.email === emailLogado);
        
        let nomeParaExibir = "";

        // 4. Se encontrou o usuário e ele já configurou o "nome", usa ele
        if (usuarioEncontrado && usuarioEncontrado.nome) {
            nomeParaExibir = usuarioEncontrado.nome;
        } else {
            // 5. Se não tiver o nome, pega apenas o que vem antes do "@"
            nomeParaExibir = emailLogado.split('@')[0];
        }

        // 6. Injeta o resultado final no topo do painel
        elementoUsuario.textContent = `Bem-vindo, ${nomeParaExibir}!`;
    }
    
    // Inicializa o gerenciador do botão de tema
    inicializarToggleTema();
});

// ==========================================================================
//  5. LOGOUT
// ==========================================================================
function logout() {
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');
    window.location.href = `${window.BASE_URL}/public/pages/index.html`;
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

    aplicarTema(localStorage.getItem('theme') || 'dark');

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        aplicarTema(current === 'dark' ? 'light' : 'dark');
    });
}