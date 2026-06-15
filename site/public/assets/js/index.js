document.addEventListener("DOMContentLoaded", () => {
    // 1. TRAVA DE SEGURANÇA: Verifica se o usuário é gestor
    const sessao = JSON.parse(localStorage.getItem('sessaoGeTech'));
    const BASE_URL = window.location.origin + "/GeTech";

    // Se não houver sessão, se não estiver ativo, ou se o perfil NÃO for gestor
    if (!sessao || !sessao.loginAtivo || sessao.perfil !== 'gestor') {
        alert("Acesso restrito. Apenas gestores podem acessar este painel.");
        // Redireciona para a página de login
        window.location.href = `${BASE_URL}/Site C/pages/index.html`;
        return; // Para a execução do resto do script
    }

    // 2. SUAS ANIMAÇÕES ORIGINAIS (Só executam se passar na trava acima)
    const heroCard = document.querySelector('.hero-card');
    const modulesGrid = document.querySelector('.modules-grid');
    const statsGrid = document.querySelector('.stats-grid');
    const sectionTitles = document.querySelectorAll('.section-title');
    
    setTimeout(() => {
        if (heroCard) heroCard.classList.remove('hidden-track');
        if (modulesGrid) modulesGrid.classList.remove('hidden-track');
        if (statsGrid) statsGrid.classList.remove('hidden-track');
        
        sectionTitles.forEach(title => {
            title.classList.remove('hidden-track');
        });
    }, 200);
});