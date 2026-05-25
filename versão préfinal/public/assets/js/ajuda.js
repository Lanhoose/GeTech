document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEÇÃO DE ELEMENTOS ---
    const cards = document.querySelectorAll('.category-card');
    const answerBox = document.getElementById('answerBox');
    const answerContent = document.getElementById('answerContent');
    const closeAnswerBtn = document.querySelector('.close-answer');
    const searchInput = document.getElementById('helpSearch');
    const btnSearch = document.getElementById('btnSearch');
    const btnShowAll = document.getElementById('btnShowAll');

    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const closeChatBtn = document.getElementById('closeChat');
    const sendBtn = document.getElementById('sendMsg');
    const userMsgInput = document.getElementById('userMsg');

    // --- 2. CONFIGURAÇÃO DO INDICADOR DE DIGITAÇÃO ---
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerText = 'GeTech IA está digitando...';
    typingIndicator.style.display = 'none';
    chatMessages.appendChild(typingIndicator);

    // ==========================================================================
    // 3. BASE DE CONHECIMENTO DA IA (Pré-programada com o tema GeTech)
    // ==========================================================================
    const iaKnowledgeBase = {
        planos: "A GeTech possui 3 planos estruturados para sua indústria:<br><br>• <strong>Essencial</strong>: Monitoramento básico para até 5 máquinas e suporte 24h.<br>• <strong>Pro Performance</strong>: Nosso principal plano! Inclui sensores IoT, Manutenção Preditiva ativa e suporte em até 4h.<br>• <strong>Enterprise</strong>: Solução sob medida para parques industriais ilimitados com integração total via API.",
        preco: "O plano <strong>Essencial</strong> custa R$ 499/mês e o plano <strong>Pro Performance</strong> está R$ 1.299/mês. Para o plano corporativo <strong>Enterprise</strong>, nossa engenharia realiza uma consultoria gratuita para montar o orçamento.",
        iot: "Nossos <strong>sensores IoT</strong> coletam vibração, temperatura e rotação magnética do maquinário em tempo real. Os dados são criptografados e enviados diretamente para o seu painel de controle.",
        preditiva: "A <strong>Manutenção Preditiva</strong> usa algoritmos de Inteligência Artificial para analisar os dados dos sensores IoT. Ela identifica anomalias microscópicas e avisa sua equipe semanas antes de uma quebra real acontecer, reduzindo custos em até 35%.",
        api: "Sim! O plano Enterprise libera acesso completo à nossa <strong>API RESTful</strong>, permitindo que você conecte os alertas e métricas da GeTech diretamente com o ERP da sua empresa (como SAP, TOTVS, etc).",
        suporte: "Nosso suporte técnico especializado atende via chat ou abertura de chamado. Clientes <em>Pro</em> têm tempo de resposta garantido em menos de 4 hours para paradas críticas.",
        senha: "Para alterar sua senha ou credenciais de acesso ao painel, vá no menu superior, clique em <strong>Configurações > Segurança</strong> e selecione 'Atualizar Senha'.",
        getech: "A <strong>GeTech</strong> é uma startup de tecnologia focada em <strong>soluções de monitoramento e manutenção preditiva</strong> para a indústria. Fundada em 2024, nossa missão é transformar dados em inteligência para reduzir custos e aumentar a eficiência operacional das fábricas brasileiras."
    };

    // ==========================================================================
    // 4. CRIAÇÃO DINÂMICA DOS BALÕES DE PERGUNTAS (SUGESTÕES)
    // ==========================================================================
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'chat-suggestions';

    const suggestionsList = [
        { label: "📋 Planos", query: "Quais são os planos da GeTech?" },
        { label: "💰 Valores", query: "Qual o preço dos pacotes?" },
        { label: "🔌 Sensores IoT", query: "Como funcionam os sensores IoT?" },
        { label: "🤖 Mnt. Preditiva", query: "O que é manutenção preditiva?" },
        { label: "💻 API", query: "Vocês possuem integração via API?" },
        { label: "🛠️ Suporte", query: "Como funciona o suporte técnico?" },
        { label: "🎰 GeTech", query: "O que é a GeTech?" }
    ];

    suggestionsList.forEach(item => {
        const chip = document.createElement('button');
        chip.className = 'chip-btn';
        chip.innerText = item.label;
        
        chip.addEventListener('click', () => {
            userMsgInput.value = item.query;
            handleChatSend();
        });
        
        suggestionsContainer.appendChild(chip);
    });

    const chatInputArea = chatWindow.querySelector('.chat-input');
    chatWindow.insertBefore(suggestionsContainer, chatInputArea);

    // --- 5. FUNÇÕES DO CHAT DA IA ---
    const appendMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${sender}`;
        msgDiv.innerHTML = text;
        
        chatMessages.insertBefore(msgDiv, typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const getAiResponse = (userText) => {
        const text = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (text.includes("plano") || text.includes("assinar") || text.includes("pacote")) return iaKnowledgeBase.planos;
        if (text.includes("preco") || text.includes("valor") || text.includes("quanto custa") || text.includes("custo")) return iaKnowledgeBase.preco;
        if (text.includes("iot") || text.includes("sensor") || text.includes("hardware") || text.includes("dispositivo")) return iaKnowledgeBase.iot;
        if (text.includes("preditiva") || text.includes("quebra") || text.includes("falha") || text.includes("manutencao")) return iaKnowledgeBase.preditiva;
        if (text.includes("api") || text.includes("integracao") || text.includes("conectar") || text.includes("erp")) return iaKnowledgeBase.api;
        if (text.includes("suporte") || text.includes("ajuda") || text.includes("tecnico") || text.includes("atendimento")) return iaKnowledgeBase.suporte;
        if (text.includes("senha") || text.includes("login") || text.includes("conta") || text.includes("acesso")) return iaKnowledgeBase.senha;
        if (text.includes("getech") || text.includes("ge tech") || text.includes("empresa")) return iaKnowledgeBase.getech;

        return "Desculpe, ainda estou aprendendo sobre este assunto técnico. 🤖<br><br>Use os balões acima ou pergunte sobre: <strong>planos</strong>, <strong>preços</strong>, <strong>sensores IoT</strong> ou <strong>manutenção preditiva</strong>.";
    };

    const handleChatSend = () => {
        const query = userMsgInput.value.trim();
        if (!query) return;

        appendMessage(query, 'user');
        userMsgInput.value = "";

        typingIndicator.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            typingIndicator.style.display = 'none';
            const botAnswer = getAiResponse(query);
            appendMessage(botAnswer, 'bot');
        }, 1000);
    };

    // --- 6. FUNÇÕES DA CENTRAL DE AJUDA (BUSCA E CARDS) ---
    const resetUI = () => {
        searchInput.value = "";
        answerBox.style.display = 'none';
        btnShowAll.style.display = 'none';
        cards.forEach(card => card.style.display = 'block');
    };

    const handleSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) { resetUI(); return; }

        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const desc = card.querySelector('p').innerText.toLowerCase();
            card.style.display = (title.includes(query) || desc.includes(query)) ? 'block' : 'none';
        });

        btnShowAll.style.display = 'block';
        answerBox.style.display = 'none';
    };

    const showHelpBox = (text) => {
        answerContent.innerHTML = text;
        answerBox.style.display = 'block';
        answerBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // --- 7. MAPEAMENTO DE EVENTOS ---
    btnSearch.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
    btnShowAll.addEventListener('click', resetUI);
    searchInput.addEventListener('input', () => { if (!searchInput.value.trim()) resetUI(); });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const info = card.getAttribute('data-info');
            if (card.innerText.includes("Suporte Direto")) {
                chatWindow.style.display = 'flex';
                answerBox.style.display = 'none';
            } else {
                showHelpBox(info);
                chatWindow.style.display = 'none';
            }
        });
    });

    sendBtn.addEventListener('click', handleChatSend);
    userMsgInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChatSend(); });
    closeChatBtn.addEventListener('click', () => { chatWindow.style.display = 'none'; });
    if (closeAnswerBtn) closeAnswerBtn.addEventListener('click', () => { answerBox.style.display = 'none'; });

    // ==========================================================================
    // 8. LOGIC DE REDIMENSIONAMENTO MANUAL PELO TOPO (CHAT-HEADER)
    // ==========================================================================
    const chatHeader = chatWindow.querySelector('.chat-header');
    let isResizing = false;
    let initialHeight, initialWidth, startY, startX;

    chatHeader.addEventListener('mousedown', (e) => {
        // Impede de ativar o redimensionamento se clicar no botão de fechar chat
        if (e.target.closest('#closeChat')) return;

        isResizing = true;
        initialHeight = chatWindow.offsetHeight;
        initialWidth = chatWindow.offsetWidth;
        startY = e.clientY;
        startX = e.clientX;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    });

    function handleMouseMove(e) {
        if (!isResizing) return;

        // Movimento para cima aumenta a altura (relação inversa)
        const deltaY = startY - e.clientY;
        // Movimento para a esquerda aumenta a largura (relação inversa por estar fixado à direita)
        const deltaX = startX - e.clientX;

        const newHeight = initialHeight + deltaY;
        const newWidth = initialWidth + deltaX;

        // Aplica dimensões validando limites mínimos e máximos da tela
        if (newHeight >= 350 && newHeight <= window.innerHeight * 0.95) {
            chatWindow.style.height = `${newHeight}px`;
        }
        if (newWidth >= 280 && newWidth <= window.innerWidth * 0.95) {
            chatWindow.style.width = `${newWidth}px`;
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResize);
    }
});