// ==========================================================================
//  1. CONFIGURAÇÕES INICIAIS E BASE URL
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
//  4. CAPTURA E EXIBIÇÃO DO NOME DO USUÁRIO LOGADO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const emailLogado = localStorage.getItem('usuarioAtual');
    const elementoUsuario = document.getElementById('usuario');

    if (emailLogado && elementoUsuario) {
        // 1. Busca os dados do usuário usando o e-mail como chave (Padrão do seu sistema)
        const dadosPerfil = localStorage.getItem(emailLogado);
        
        let nomeParaExibir = "";

        if (dadosPerfil) {
            // 2. Converte a string salva de volta para um objeto JavaScript
            const usuarioObj = JSON.parse(dadosPerfil);
            
            // 3. Se ele tiver um nome cadastrado, usa ele
            if (usuarioObj && usuarioObj.nome) {
                nomeParaExibir = usuarioObj.nome;
            }
        }

        // 4. Fallback de Segurança: Se não houver nome salvo, corta o e-mail antes do @
        if (!nomeParaExibir) {
            nomeParaExibir = emailLogado.split('@')[0];
        }

        // 5. Renderiza na tela substituindo o texto "<p id="usuario">"
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

    aplicarTema(localStorage.getItem('theme') || 'dark');

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        aplicarTema(current === 'dark' ? 'light' : 'dark');
    });
}