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