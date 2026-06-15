document.addEventListener("DOMContentLoaded", () => {
     const sessao = JSON.parse(localStorage.getItem('sessaoGeTech'));
    const BASE_URL = window.location.origin + "/GeTech";

    // Se não houver sessão, se não estiver ativo, ou se o perfil NÃO for gestor
    if (!sessao || !sessao.loginAtivo || sessao.perfil !== 'gestor') {
        alert("Acesso restrito. Apenas gestores podem acessar este painel.");
        // Redireciona para a página de login
        window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
        return; // Para a execução do resto do script
    }
});
// =========================
//  TEMA — aplica ANTES do paint (evita flash)
// =========================
(function () {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
})();

// =========================
//  COMPONENTES
// =========================
function carregarComponente(id, arquivo) {
    return fetch(arquivo)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error('Erro ao carregar componente:', error));
}
 
 
// =========================
//  TOGGLE DE TEMA
// =========================
function inicializarToggleTema() {
    const btn  = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
 
    if (!btn) return; // sai se o header ainda não tiver o botão
 
    const aplicarTema = (tema) => {
        document.documentElement.setAttribute('data-theme', tema);
        localStorage.setItem('theme', tema);    
        if (icon) icon.textContent = tema === 'dark' ? '🌙' : '☀️';
        btn.setAttribute('aria-label', tema === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    };
 
    // Sincroniza ícone com o tema já aplicado pelo IIFE acima
    const temaAtual = document.documentElement.getAttribute('data-theme') || 'dark';
    aplicarTema(temaAtual);
 
    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        aplicarTema(current === 'dark' ? 'light' : 'dark');
    });
}
 
 
// =========================
//  INICIALIZAÇÃO
// =========================
document.addEventListener('DOMContentLoaded', () => {
 
    // Carrega header e SÓ DEPOIS inicializa toggle e login
    carregarComponente('header', '../components/header.html').then(() => {
        inicializarToggleTema();
 
        if (typeof verificarStatusLogin === 'function') {
            verificarStatusLogin();
        }
    });
 
    carregarComponente('footer', '../components/footer.html');
});