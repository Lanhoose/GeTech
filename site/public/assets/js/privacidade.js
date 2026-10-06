let modal;
let modalSucesso;

// Texto da política de privacidade altamente profissional (Adequado à LGPD)
let textoPrivacidade = [
    "POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS PESSOAIS - GETECH",
    "A GeTech Soluções em Manutenção Industrial reafirma seu compromisso com a privacidade e a segurança da informação, tratando dados pessoais e operacionais estritamente em conformidade com a LGPD (Lei nº 13.709/2018).",
    "",
    "1. ABRANGÊNCIA E FINALIDADE DO TRATAMENTO DE DADOS:",
    "• Suporte Técnico Especializado: Triagem de chamados operacionais, prestação de assistência técnica e comunicação referente a ordens de serviço.",
    "• Gestão de Manutenção Industrial: Registro do histórico de intervenções, diagnósticos preditivos e acompanhamento contínuo dos ativos industriais.",
    "",
    "2. CATEGORIZAÇÃO DAS INFORMAÇÕES TRATADAS:",
    "• Dados Cadastrais e de Contato: Nome, e-mail corporativo, telefone, cargo e empresa para gestão do relacionamento contratual.",
    "• Dados Operacionais e Técnicos: Histórico de manutenção, especificações de máquinas, relatórios de falhas e logs de chamados.",
    "",
    "3. DIREITOS DOS TITULARES DE DADOS (ART. 18 DA LGPD):",
    "O titular dos dados possui o direito de solicitar a qualquer momento a confirmação de existência de tratamento, acesso aos dados, correção de inconsistências ou a exclusão/anonimização de dados pessoais desnecessários através do nosso portal oficial.",
    "",
    "4. SEGURANÇA DA INFORMAÇÃO E PREVENÇÃO:",
    "• Criptografia Avançada: Protocolos de alta segurança para proteção na transmissão e armazenamento de relatórios e dados industriais.",
    "• Gestão Rigorosa de Acesso: Acesso restrito e concedido sob o princípio do menor privilégio apenas a profissionais autorizados.",
    "",
    "5. RETENÇÃO E CICLO DE VIDA DOS DADOS:",
    "Os dados são conservados estritamente pelo período necessário para atender às finalidades de suporte técnico e à preservação do histórico operacional dos equipamentos industriais, sendo descartados de forma segura ao término do ciclo contratual ou da exigência legal."
];

document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('modalPrivacidade');
    modalSucesso = document.getElementById('modalSucesso');

    // Se o usuário já tiver aceitado os termos anteriormente, reconstrói o botão de navegação direta
    if (localStorage.getItem('getech_termos_aceitos') === 'true') {
        renderizarBotaoIrParaIndex();
    }
});

// Exibe o modal explicativo da LGPD
function abrirModal() {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Oculta o modal explicativo da LGPD
function fecharModal() {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Fecha o modal de sucesso e redireciona para a página principal
function fecharModalSucesso() {
    if (modalSucesso) {
        modalSucesso.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    window.location.href = 'index.html';
}

// Monitora cliques fora da área dos modais para fechamento suave
window.onclick = function(event) {
    if (event.target === modal) fecharModal();
    if (event.target === modalSucesso) fecharModalSucesso();
};

// Modifica a estrutura da interface substituindo o botão de aceite pelo link de navegação
function renderizarBotaoIrParaIndex() {
    const areaBotao = document.getElementById('area-botao-aceite');
    if (areaBotao) {
        areaBotao.innerHTML = `
            <button onclick="window.location.href='index.html'" class="btn-web" style="background-color: #2563eb;">
                Ir para a Página Inicial 🚀
            </button>
        `;
    }
}

// Executa os procedimentos ao clicar em aceitar os termos
function aceitarTermos() {
    localStorage.setItem('getech_termos_aceitos', 'true');
    
    // Altera o layout substituindo o botão imediatamente
    renderizarBotaoIrParaIndex();
    
    // Dispara o pop-up customizado de sucesso em vez do alert nativo
    if (modalSucesso) {
        modalSucesso.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Função de geração de PDF assistida por biblioteca externa (jsPDF)
async function gerarPDF() {
    const lib = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    if (!lib) {
        console.error("Biblioteca jsPDF não encontrada.");
        return;
    }
    
    const doc = new lib();
    
    // Cabeçalho do PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("GeTech - Política de Privacidade e Proteção de Dados", 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Documento Oficial Corporativo • Conformidade com a Lei Geral de Proteção de Dados (LGPD)", 20, 26);
    
    // Linha de divisão
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, 190, 30);

    doc.setFontSize(9.5);
    
    let eixoY = 38;
    const margemEsquerda = 20;
    const larguraMaxima = 170;

    textoPrivacidade.slice(1).forEach(linha => {
        if (linha === "") {
            eixoY += 3;
            return;
        }

        // Destaque para as seções principais
        if (linha.match(/^\d\./)) {
            doc.setFont("helvetica", "bold");
        } else {
            doc.setFont("helvetica", "normal");
        }

        const linhasQuebradas = doc.splitTextToSize(linha, larguraMaxima);
        
        // Paginação automática
        if (eixoY + (linhasQuebradas.length * 5) > 275) {
            doc.addPage();
            eixoY = 20;
        }

        doc.text(linhasQuebradas, margemEsquerda, eixoY);
        eixoY += (linhasQuebradas.length * 4.5) + 2.5;
    });

    doc.save("Privacidade_GeTech.pdf");
}