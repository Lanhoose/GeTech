let modal;
let modalSucesso;

// Texto da política de privacidade organizado de forma completa e profissional (LGPD)
let textoPrivacidade = [
    "GeTech - Política de Privacidade e Proteção de Dados",
    "A GeTech está comprometida com a segurança, transparência e proteção dos dados pessoais e operacionais de seus clientes e parceiros, em conformidade com a LGPD (Lei nº 13.709/2018).",
    "",
    "1. Finalidade do Tratamento de Dados:",
    "- Suporte Técnico: Atendimento, gerenciamento de chamados e comunicação sobre ordens de serviço.",
    "- Gestão de Manutenção Industrial: Registro do histórico operacional e acompanhamento das máquinas.",
    "",
    "2. Coleta e Categorização dos Dados:",
    "- Dados Cadastrais: Nome, e-mail, telefone, cargo e empresa para identificação e suporte.",
    "- Dados Técnicos: Histórico de manutenção, modelos de máquinas e relatórios de falhas.",
    "",
    "3. Direitos do Titular dos Dados:",
    "Você pode solicitar a qualquer momento o acesso, confirmação, correção, atualização ou exclusão de seus dados pessoais através dos nossos canais de suporte.",
    "",
    "4. Segurança da Informação:",
    "- Criptografia: Implementamos protocolos para proteger dados em transmissão e armazenamento.",
    "- Controle de Acesso: Acesso restrito apenas a profissionais autorizados.",
    "",
    "5. Retenção e Descarte de Dados:",
    "Mantemos os dados apenas pelo período necessário para atender às finalidades de suporte e suporte ao histórico do equipamento, realizando o descarte seguro após o término da necessidade legal ou contratual."
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
    
    // Título do PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("GeTech - Política de Privacidade e Proteção de Dados", 20, 20);
    
    // Subtítulo
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Documento oficial gerado pelo portal em conformidade com a LGPD.", 20, 27);
    
    // Linha divisória
    doc.line(20, 31, 190, 31);

    // Configurações para o corpo do texto
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    let eixoY = 40;
    const margemEsquerda = 20;
    const larguraMaxima = 170; // Evita que o texto ultrapasse a margem da página

    textoPrivacidade.slice(1).forEach(linha => {
        if (linha === "") {
            eixoY += 4; // Espaçamento entre parágrafos
            return;
        }

        // Destaca títulos e subtópicos em negrito no PDF
        if (linha.match(/^\d\./)) {
            doc.setFont("helvetica", "bold");
        } else {
            doc.setFont("helvetica", "normal");
        }

        // Quebra o texto automaticamente para caber na página
        const linhasQuebradas = doc.splitTextToSize(linha, larguraMaxima);
        
        // Verifica se precisa de uma nova página
        if (eixoY + (linhasQuebradas.length * 5) > 280) {
            doc.addPage();
            eixoY = 20;
        }

        doc.text(linhasQuebradas, margemEsquerda, eixoY);
        
        // Ajusta o eixo Y dinamicamente para o próximo bloco de texto
        eixoY += (linhasQuebradas.length * 5) + 3;
    });

    doc.save("Privacidade_GeTech.pdf");
}