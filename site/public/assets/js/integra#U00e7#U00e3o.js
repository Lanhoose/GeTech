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

const mockPartnersData = [
    {
        nome: "Logistock",
        descricao: "Soluções de logística e transporte.",
        url: "https://jvap-bit.github.io/sistema_ERP/",
        destaque: true,
        beneficios: ["Rastreio em tempo real", "Segurança"]
    },
    {
        nome: "FedEx",
        descricao: "Integração completa de entrega e rastreio.",
        url: "https://www.fedex.com/pt-br/home.html?cmp=KNC-1009093-1-1-950-1000000-LAC-BR-PT-SearchPmaxBrand&gclsrc=aw.ds&gad_source=1&gad_campaignid=23350632180&gbraid=0AAAAADlsr1Y0obO2Lt7tHZ5BTQJhqC9xN&gclid=Cj0KCQjw_IXQBhCkARIsADqELbJ425llrGH-ek8_VaIcM27WywTnm2eHNH-e-CXkavUqhtGe7NpMSrkaAvfMEALw_wcB",
        destaque: false,
        beneficios: ["Rastreio em tempo real", "Segurança"]
    },
    {
        nome: "Tecfag",
        descricao: "Encomenda de maquinas e peças.",
        url: "https://tecfagpersonnalite.com.br/landing",
        destaque: false,
        beneficios: ["Desconto em peças de reposição", "Suporte prioritário"]
    },
    {
        nome: "Mercado Pago",
        descricao: "Processamento de pagamentos seguro.",
        url: "https://www.mercadopago.com.br/",
        destaque: false,
        beneficios: ["Antifraude integrado", "Taxas reduzidas"]
    },
    {
        nome: "Getninjas",
        descricao: "Contratação de mecânicos industriais.",
        url: "https://www.getninjas.com.br/",
        destaque: false,
        beneficios: ["Mecânicos certificados", "Disponibilidade 24h"]
    }
];

function renderPartners(partners) {
    const grid = document.getElementById('partners-grid');
    if (!grid) return; 
    
    grid.innerHTML = '';

    partners.forEach(partner => {
        const card = document.createElement('div');
        card.className = `plan-card ${partner.destaque ? 'featured' : ''}`;

        // Estrutura limpa: sem estilos inline fixos para não quebrar o modo claro
        card.innerHTML = `
            ${partner.destaque ? '<div class="badge">Destaque</div>' : ''}
            
            <div class="plan-info">
                <h3>${partner.nome}</h3>
                <span class="partner-tag">GeTech Partner</span>
                <p class="partner-desc">${partner.descricao}</p>
                <ul class="partner-benefits">
                    ${partner.beneficios.map(b => `<li>${b}</li>`).join('')}
                </ul>
            </div>

            <button class="connect-btn" onclick=\"window.open('${partner.url}', '_blank')\">Conectar</button>
        `;

        grid.appendChild(card);
    });
}

// Inicializa a renderização assim que o script carregar
window.onload = () => {
    setTimeout(() => {
        renderPartners(mockPartnersData);
    }, 800); 
};