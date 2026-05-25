document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os cards contidos na estrutura 3D
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            // Liga/Desliga a classe 'virado' rotacionando o elemento em 180 graus no CSS
            card.classList.toggle('virado');
        });
    });
});