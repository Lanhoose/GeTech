

let modal;
let modalSucesso;

// Texto da política de privacidade organizado para reuso
let textoPrivacidade = [
    "Finalidade: Seus dados são usados apenas para suporte técnico.",
    "Acesso: Você pode solicitar a correção ou exclusão de seus dados a qualquer momento.",
    "Segurança: Implementamos criptografia para proteger informações de manutenção industrial.",
    "Retenção: Mantemos os dados apenas pelo período necessário para o histórico da máquina."
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

// Função de geração de PDF assistida por biblioteca externa
async function gerarPDF() {
    const lib = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    if (!lib) {
        console.error("Biblioteca jsPDF não encontrada.");
        return;
    }
    
    const doc = new lib();
    
    // Título do PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("GeTech - Política de Privacidade", 20, 20);
    
    // Subtítulo
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Documento oficial gerado pelo portal.", 20, 28);
    
    // Linha divisória
    doc.line(20, 33, 190, 33);

    // Configurações para o corpo do texto
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    let eixoY = 45;
    const margemEsquerda = 20;
    const larguraMaxima = 170; // Evita que o texto saia para a direita

    textoPrivacidade.forEach(linha => {
        // Quebra o texto automaticamente para caber na página
        const linhasQuebradas = doc.splitTextToSize(linha, larguraMaxima);
        
        doc.text(linhasQuebradas, margemEsquerda, eixoY);
        
        // Ajusta o eixo Y dinamicamente para o próximo bloco de texto
        eixoY += (linhasQuebradas.length * 7) + 5;
    });

    doc.save("Privacidade_GeTech.pdf");
}