let modal;

// Texto da política de privacidade organizado para reuso
let textoPrivacidade = [
    "Finalidade: Seus dados são usados apenas para suporte técnico.",
    "Acesso: Você pode solicitar a correção ou exclusão de seus dados a qualquer momento.",
    "Segurança: Implementamos criptografia para proteger informações de manutenção industrial.",
    "Retenção: Mantemos os dados apenas pelo período necessário para o histórico da máquina."
];

document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('modalPrivacidade');

    // Estilo para quando já aceitou
    if (localStorage.getItem('getech_termos_aceitos') === 'true') {
        const btnAceite = document.getElementById('btnAceite');
        if (btnAceite) {
            btnAceite.innerHTML = "✅ Termos já aceitos";
            btnAceite.style.backgroundColor = "#28a745";
            btnAceite.onclick = null;
        }
    }
});

function abrirModal() {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function fecharModal() {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

window.onclick = function(event) {
    if (event.target === modal) fecharModal();
};

function aceitarTermos() {
    localStorage.setItem('getech_termos_aceitos', 'true');
    alert('Obrigado por aceitar nossos termos!');
    window.location.href = '/public/pages/index.html'; 
}

// ESTA É A FUNÇÃO ATUALIZADA QUE VOCÊ DEVE SUBSTITUIR:
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