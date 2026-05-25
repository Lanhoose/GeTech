document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONTROLE DO MODAL ---
    const postModal = document.getElementById('postModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const maintenanceForm = document.getElementById('maintenanceForm');
    const feedContainer = document.getElementById('feedContainer');

    // Abre o formulário modal ao clicar no botão superior
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            postModal.style.display = 'flex';
        });
    }

    // Fecha o modal ao clicar no "X"
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            postModal.style.display = 'none';
        });
    }

    // Fecha o modal se o usuário clicar na área escura de fora
    window.addEventListener('click', (e) => {
        if (e.target === postModal) {
            postModal.style.display = 'none';
        }
    });

    // --- 2. CAPTURA DINÂMICA DO LOCALSTORAGE (BASEADO NO SEU PRINT) ---
    const getLoggedUser = () => {
        // 1. Pega o e-mail da chave 'usuarioAtual'
        const emailLogado = localStorage.getItem('usuarioAtual'); 
        
        // 2. Pega a lista completa de usuários cadastrados
        const listaUsuariosRaw = localStorage.getItem('usuarios');

        // Configuração padrão de contingência caso não ache ninguém
        let nomeUsuario = "Desenvolvedor GeTech";
        let emailUsuario = emailLogado || "anonimo@getech.com.br";

        if (emailLogado) {
            // Se houver uma lista de usuários cadastrados, procura o nome correspondente ao e-mail
            if (listaUsuariosRaw) {
                try {
                    const usuarios = JSON.parse(listaUsuariosRaw);
                    // Procura o usuário que possui o mesmo e-mail armazenado no 'usuarioAtual'
                    const usuarioEncontrado = usuarios.find(u => u.email === emailLogado);
                    
                    if (usuarioEncontrado && usuarioEncontrado.nome) {
                        nomeUsuario = usuarioEncontrado.nome;
                    } else {
                        // Se o cadastro não tiver a propriedade 'nome', extrai o termo antes do '@'
                        const parteAntesDoAt = emailLogado.split('@')[0];
                        nomeUsuario = parteAntesDoAt.charAt(0).toUpperCase() + parteAntesDoAt.slice(1);
                    }
                } catch (e) {
                    console.error("Erro ao processar lista de usuários do localStorage", e);
                }
            } else {
                // Caso não tenha a lista completa carregada, usa o prefixo do e-mail como nome
                const parteAntesDoAt = emailLogado.split('@')[0];
                nomeUsuario = parteAntesDoAt.charAt(0).toUpperCase() + parteAntesDoAt.slice(1);
            }
        }

        return {
            name: nomeUsuario,
            email: emailUsuario
        };
    };

    // --- 3. SUBMISSÃO E CRIAÇÃO DO CARD NO FEED ---
    if (maintenanceForm) {
        maintenanceForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Captura os dados do formulário
            const title = document.getElementById('machineName').value;
            const type = document.getElementById('type').value;
            const desc = document.getElementById('description').value;
            
            // Formatação automática da data corrente local
            const currentDate = new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Obtém dinamicamente o nome e e-mail baseado no seu LocalStorage atual
            const author = getLoggedUser();

            // Estrutura o HTML do novo Card do Feed
            const card = document.createElement('div');
            card.className = 'post-card';

            card.innerHTML = `
                <div class="post-meta">
                    <span class="post-badge">${type}</span>
                    <span class="post-date">${currentDate}</span>
                </div>
                <h3 class="post-title">${title}</h3>
                <p class="post-desc">${desc.replace(/\n/g, '<br>')}</p>
                <div class="post-author-box">
                    <div class="author-avatar">${author.name.charAt(0).toUpperCase()}</div>
                    <div class="author-info">
                        <span class="author-name">${author.name}</span>
                        <span class="author-email">${author.email}</span>
                    </div>
                </div>
            `;

            // Insere o post criado no topo do feed (o mais recente primeiro)
            if (feedContainer) {
                feedContainer.insertBefore(card, feedContainer.firstChild);
            }

            // Limpa o formulário e fecha o modal de forma fluida
            this.reset();
            if (postModal) postModal.style.display = 'none';
        });
    }
});