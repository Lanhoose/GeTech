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

// Dicionário com dados exclusivos que serão injetados dinamicamente na Overlay
const planosExclusivosInfo = {
    "Essencial": [
        "Acesso à manutenção Corretiva Agendada",
        "Relatórios Mensais consolidados em PDF",
        "Suporte técnico ágil em até 24h",
        "Gestão monitorada de até 5 Máquinas simultâneas",
        "Acesso básico ao painel de controle"
    ],
    "Pro Performance": [
        "Tecnologia de Manutenção Preditiva com sensores IoT",
        "Dashboard industrial atualizado em Tempo Real",
        "Suporte Prioritário Emergencial com SLA de 4h",
        "Gestão expandida para até 20 Máquinas",
        "Análise gráfica de Vibração e Temperatura inclusa",
        "Estatísticas de OEE integradas"
    ],
    "Enterprise": [
        "Gestão de Parque Industrial Ilimitado",
        "Consultoria Técnica e de Engenharia Dedicada",
        "Integração total via API RESTful (SAP, TOTVS, etc)",
        "Treinamento operacional de Equipe In-loco",
        "Customização completa de alertas e relatórios de métricas",
        "Acordo de Nível de Serviço (SLA) Personalizado"
    ]
};

function selectPlan(planName) {
    // 1. Salva a escolha do usuário no localStorage
    localStorage.setItem('planoAdquirido', planName);
    
    // 2. Captura os elementos da Modal
    const modal = document.getElementById('planModal');
    const modalPlanName = document.getElementById('modalPlanName');
    const modalBenefitsList = document.getElementById('modalBenefitsList');

    if (!modal || !modalPlanName || !modalBenefitsList) return;

    // 3. Atualiza os textos da Modal baseados no plano clicado
    modalPlanName.innerText = planName;
    
    // Limpa a lista anterior de benefícios
    modalBenefitsList.innerHTML = "";

    // Procura os benefícios no objeto. Se não achar (ex: se mudar o nome do botão), mostra um padrão.
    const beneficios = planosExclusivosInfo[planName] || ["Benefícios padrão do sistema GeTech."];

    // Injeta os novos itens de lista dinamicamente
    beneficios.forEach(beneficio => {
        const li = document.createElement('li');
        li.innerText = beneficio;
        modalBenefitsList.appendChild(li);
    });

    // 4. Exibe a modal adicionando a classe "active"
    modal.classList.add('active');
}

// Configura o fechamento da modal clicando no 'X' ou fora da caixa
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById('planModal');
    const closeModal = document.getElementById('closeModal');

    if (closeModal && modal) {
        // Fecha no botão X
        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Fecha se o usuário clicar no fundo escuro (fora do card)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // --- Código de animação dos cartões (Corrigido as aspas com escape inválido) ---
    const cards = document.querySelectorAll('.plan-card');
    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "all 0.4s ease";

        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 200);
    });
});