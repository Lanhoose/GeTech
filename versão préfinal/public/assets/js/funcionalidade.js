document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('closeBtn');
    const confirmBtn = document.querySelector('.confirm-btn');
    const buttons = document.querySelectorAll('.btn-more');

    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');
    const modalIcon = document.querySelector('.modal-main-icon'); // Captura o ícone do modal

    // Dicionário de informações específicas para a GeTech
    const servicosInfo = {
        "Cloud Computing": "Nossa infraestrutura em nuvem oferece disponibilidade de 99,9%, garantindo que seus dados estejam sempre acessíveis.",
        "Inteligência Artificial": "Algoritmos avançados para análise de dados e automação de tarefas repetitivas em larga escala.",
        "Cibersegurança": "Proteção total contra ataques DDoS, Ransomware e garantia de integridade de dados.",
        "Apps Mobile": "Desenvolvemos interfaces intuitivas e backends robustos para sua aplicação decolar nas lojas.",
        "Big Data": "Processamento de dados em tempo real para gerar insights valiosos para seu negócio.",
        "IoT Solutions": "Conectamos sua indústria ou residência com tecnologia de sensores e monitoramento remoto."
    };

    // Adiciona evento em todos os botões de Saiba Mais
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // .closest garante que pegamos o card correto mesmo se houver elementos internos
            const card = e.target.closest('.feature-card');
            const tituloSelecionado = card.querySelector('h3').innerText;
            
            // Pega as classes do ícone correspondente do card
            const iconeCard = card.querySelector('.icon-box i').className;
            
            // Preenche o modal com o título e texto corretos
            modalTitle.innerText = tituloSelecionado;
            modalText.innerText = servicosInfo[tituloSelecionado];
            
            // Atualiza o ícone do modal dinamicamente
            modalIcon.className = `${iconeCard} modal-main-icon`;
            
            // Abre o modal
            modal.style.display = 'flex';
        });
    });

    // Funções para fechar o modal
    const fechar = () => {
        modal.style.display = 'none';
    };

    closeBtn.addEventListener('click', fechar);
    confirmBtn.addEventListener('click', fechar);

    // Fecha se clicar no fundo escuro
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            fechar();
        }
    });
});