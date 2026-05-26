document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEÇÃO DE ELEMENTOS E CONTROLE DO MODAL ---
    const postModal = document.getElementById('postModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const maintenanceForm = document.getElementById('maintenanceForm');
    const feedContainer = document.getElementById('feedContainer');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            postModal.style.display = 'flex';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            postModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === postModal) {
            postModal.style.display = 'none';
        }
    });

    // --- 2. CAPTURA DINÂMICA DO LOCALSTORAGE PARA NOVOS POSTS ---
    const getLoggedUser = () => {
        const emailLogado = localStorage.getItem('usuarioAtual'); 
        const listaUsuariosRaw = localStorage.getItem('usuarios');

        let nomeUsuario = "Desenvolvedor GeTech";
        let emailUsuario = emailLogado || "anonimo@getech.com.br";

        if (emailLogado) {
            if (listaUsuariosRaw) {
                try {
                    const usuarios = JSON.parse(listaUsuariosRaw);
                    const usuarioEncontrado = usuarios.find(u => u.email === emailLogado);
                    
                    if (usuarioEncontrado && usuarioEncontrado.nome) {
                        nomeUsuario = usuarioEncontrado.nome;
                    } else {
                        const parteAntesDoAt = emailLogado.split('@')[0];
                        nomeUsuario = parteAntesDoAt.charAt(0).toUpperCase() + parteAntesDoAt.slice(1);
                    }
                } catch (e) {
                    console.error("Erro ao processar lista de usuários", e);
                }
            } else {
                const parteAntesDoAt = emailLogado.split('@')[0];
                nomeUsuario = parteAntesDoAt.charAt(0).toUpperCase() + parteAntesDoAt.slice(1);
            }
        }

        return { name: nomeUsuario, email: emailUsuario };
    };

    // --- 3. POSTS FICTÍCIOS INICIAIS (CARREGADOS AUTOMATICAMENTE) ---
    const fakedPosts = [
        {
            title: "Como configurar as variáveis de ambiente no Node.js",
            type: "📚 Tutorial",
            date: "22/05/2026",
            desc: "Um guia rápido para proteger suas chaves de API utilizando o pacote dotenv. Nunca subam o arquivo .env diretamente para o GitHub de vocês, adicionem sempre no .gitignore!",
            authorName: "Ana Clara Costa",
            authorEmail: "anaclara.dev@getech.com.br"
        },
        {
            title: "Erro bizarro ao rodar containers Docker em lote",
            type: "❓ Dúvida",
            date: "20/05/2026",
            desc: "Alguém da equipe de infraestrutura já passou pelo erro 'port is already allocated' no Windows WSL2 mesmo depois de dar um down em todos os containers ativos? Se sim, qual comando resolveu sem precisar reiniciar a máquina?",
            authorName: "Lucas Ramos",
            authorEmail: "lucas.ramos@getech.com.br"
        },
        {
            title: "Lançamento oficial do ECMAScript 2026",
            type: "🚀 Notícia",
            date: "18/05/2026",
            desc: "As novas propostas aprovadas trazem melhorias absurdas para a manipulação de objetos assíncronos e novos helpers nativos para arrays. Vale a pena dar uma conferida na documentação oficial.",
            authorName: "Mariana Souza",
            authorEmail: "mari.souza@getech.com.br"
        }
    ];

    // Função auxiliar para gerar visualmente o componente de Card
    const createPostCard = (title, type, date, desc, authorName, authorEmail) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
            <div class="post-meta">
                <span class="post-badge">${type}</span>
                <span class="post-date">${date}</span>
            </div>
            <h3 class="post-title">${title}</h3>
            <p class="post-desc">${desc.replace(/\n/g, '<br>')}</p>
            <div class="post-author-box">
                <div class="author-avatar">${authorName.charAt(0).toUpperCase()}</div>
                <div class="author-info">
                    <span class="author-name">${authorName}</span>
                    <span class="author-email">${authorEmail}</span>
                </div>
            </div>
        `;
        return card;
    };

    // Renderiza os posts padrão na tela ao entrar
    if (feedContainer) {
        fakedPosts.forEach(post => {
            const cardElement = createPostCard(post.title, post.type, post.date, post.desc, post.authorName, post.authorEmail);
            feedContainer.appendChild(cardElement); // Coloca um abaixo do outro
        });
    }

    // --- 4. SUBMISSÃO DE NOVOS POSTS PELO FORMULÁRIO ---
    if (maintenanceForm) {
        maintenanceForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('machineName').value;
            const type = document.getElementById('type').value;
            const desc = document.getElementById('description').value;
            
            const currentDate = new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Dados dinâmicos do LocalStorage de quem está clicando no botão
            const loggedUser = getLoggedUser();

            // Cria o card do usuário atual
            const newCard = createPostCard(title, type, currentDate, desc, loggedUser.name, loggedUser.email);

            // Insere no TOPO do feed (antes dos posts fictícios)
            if (feedContainer) {
                feedContainer.insertBefore(newCard, feedContainer.firstChild);
            }

            this.reset();
            if (postModal) postModal.style.display = 'none';
        });
    }
});