function selectPlan(planName) {
    // 1. Correção: Mudança para crases para o template literal funcionar dinamicamente
    alert(`Ótima escolha! Você selecionou o plano: ${planName}`);
    
    // 2. Armazena a escolha no navegador do usuário para ler em qualquer outra página
    localStorage.setItem('planoAdquirido', planName);
    
    // 3. Exemplo de redirecionamento correto (enviando o plano pela URL)
    // Descomente a linha abaixo quando tiver a página de destino pronta:
    // window.location.href = `checkout.html?plano=${encodeURIComponent(planName)}`;
}

// Pequeno efeito de scroll suave para os cards
document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll('.plan-card');
    cards.forEach((card, index) => {
        // Garante que o estado inicial permita a transição suave
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "all 0.4s ease";

        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 200);
    });
});