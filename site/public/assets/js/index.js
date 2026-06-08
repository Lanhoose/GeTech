document.addEventListener("DOMContentLoaded", () => {
    // Seleciona todos os blocos principais e títulos estruturais que usam a animação
    const heroCard = document.querySelector('.hero-card');
    const modulesGrid = document.querySelector('.modules-grid');
    const statsGrid = document.querySelector('.stats-grid');
    const sectionTitles = document.querySelectorAll('.section-title');
    
    // Um pequeno delay de 200ms para carregar a página de forma elegante e fluida
    setTimeout(() => {
        if (heroCard) heroCard.classList.remove('hidden-track');
        if (modulesGrid) modulesGrid.classList.remove('hidden-track');
        if (statsGrid) statsGrid.classList.remove('hidden-track');
        
        // Ativa a animação para todos os títulos encontrados
        sectionTitles.forEach(title => {
            title.classList.remove('hidden-track');
        });
    }, 200);
});