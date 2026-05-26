/* ==========================================
   INTERAÇÕES DA PÁGINA SOBRE
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. EFEITO DE INTERAÇÃO DO CARD (Hover)
    const card = document.querySelector('.card');
    if (card) {
        // Aplica a transição suave via JS (para não conflitar com a animação de entrada do CSS)
        card.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease";

        card.addEventListener('mouseenter', () => {
            card.style.transform = "translateY(-12px) scale(1.01)";
            card.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.5)";
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = "translateY(0) scale(1)";
            card.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
        });
    }

    // 2. LÓGICA DO MODAL (OVERLAY)
    const btnSaibaMais = document.getElementById('btn-saiba-mais');
    const modal = document.getElementById('modal-overlay');
    const btnFechar = document.getElementById('btn-fechar-modal');

    if (btnSaibaMais && modal) {
        // Função para abrir
        btnSaibaMais.addEventListener('click', () => {
            modal.classList.add('active');
        });

        // Função para fechar
        const fecharModal = () => {
            modal.classList.remove('active');
        };

        if (btnFechar) {
            btnFechar.addEventListener('click', fecharModal);
        }

        // Fechar ao clicar no fundo escuro (overlay)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }

    // 3. ATIVAR MENU MOBILE
    ativarMenuMobile();
});

/* ==========================================
   FUNÇÃO DO MENU MOBILE
   ========================================== */
function ativarMenuMobile() {
    const btnMobile = document.getElementById('btn-mobile');
    const nav = document.getElementById('nav');
    
    if (btnMobile && nav) {
        btnMobile.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}