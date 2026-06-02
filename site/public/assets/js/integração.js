const mockPartnersData = [
    {
        nome: "FedEx",
        descricao: "Integração completa de entrega e rastreio.",
        url: "https://www.fedex.com/pt-br/home.html?cmp=KNC-1009093-1-1-950-1000000-LAC-BR-PT-SearchPmaxBrand&gclsrc=aw.ds&gad_source=1&gad_campaignid=23350632180&gbraid=0AAAAADlsr1Y0obO2Lt7tHZ5BTQJhqC9xN&gclid=Cj0KCQjw_IXQBhCkARIsADqELbJ425llrGH-ek8_VaIcM27WywTnm2eHNH-e-CXkavUqhtGe7NpMSrkaAvfMEALw_wcB",
        destaque: true,
        beneficios: ["Rastreio em tempo real", "Segurança"]
    },
    {
        nome: "Tecfag",
        descricao: "Encomenda de maquinas e peças.",
        url: "https://tecfagpersonnalite.com.br/landingpage/personnalite-top-5/?utm_source=google&utm_medium=cpc&utm_campaign={campaignname}&utm_term=maquina%20empacotadora%20automatica&utm_content=775207427211&adgroupid=192606386304&adposition=&device=c&matchtype=b&network=g&gad_source=1&gad_campaignid=23038287531&gbraid=0AAAAADd8NgvEGxccVHYoY4Exgo4-eYeFO&gclid=Cj0KCQjw_IXQBhCkARIsADqELbKxZrPc5FBHgmHVm8bw733LYM64MZbzGbeHf26w-VIlCgF77sOr27UaAj85EALw_wcB",
        destaque: false,
        beneficios: ["Antifraude integrado", "Taxas reduzidas"]
    },
    {
        nome: "Getninjas",
        descricao: "Contratação de mecânicos industriais.",
        url: "https://www.getninjas.com.br/",
        destaque: false,
        beneficios: ["Antifraude integrado", "Taxas reduzidas"]
    },
    {
        nome: "Logistock",
        descricao: "Soluções de logística e transporte.",
        url: "https://github.com/jvap-bit/sistema_ERP/",
        destaque: false,
        beneficios: ["Rastreio em tempo real", "Segurança"]
    }
];

function renderPartners(partners) {
    const grid = document.getElementById('partners-grid');
    if (!grid) return; // Segurança caso o elemento não exista no HTML
    
    grid.innerHTML = '';

    partners.forEach(partner => {
        const card = document.createElement('div');
        card.className = `plan-card ${partner.destaque ? 'featured' : ''}`;

        card.innerHTML = `
            ${partner.destaque ? '<div class="badge">Destaque</div>' : ''}
            
            <div class="plan-info">
                <h3>${partner.nome}</h3>
                <p style="color: #00c6ff; font-weight: bold; margin: 5px 0;">GeTech Partner</p>
                <p style="font-size: 14px; color: #ccc;">${partner.descricao}</p>
                <ul>
                    ${partner.beneficios.map(b => `<li>✔ ${b}</li>`).join('')}
                </ul>
            </div>

            <button onclick="window.open('${partner.url}', '_blank')">Visitar Site</button>
        `;

        grid.appendChild(card);
    });
}

window.onload = () => {
    setTimeout(() => {
        renderPartners(mockPartnersData);
    }, 800); 
};