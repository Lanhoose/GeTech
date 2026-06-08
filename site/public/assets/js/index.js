document.addEventListener("DOMContentLoaded", () => {
    const statsGrid = document.querySelector('.stats-grid');
    
    if (statsGrid) {
        // Um pequeno delay de 200ms após o carregamento para ficar mais elegante
        setTimeout(() => {
            statsGrid.classList.remove('hidden-track');
        }, 200);
    }
});