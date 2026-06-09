// Atribuição global segura para evitar o erro "Identifier 'BASE_URL' has already been declared"
window.BASE_URL = window.location.origin + "/GeTech";

function verificarStatusLogin() {
    const authSection = document.getElementById('auth-section');
    const menuConfig = document.getElementById('menu-configuracoes');

    const estaLogado = localStorage.getItem('logado') === 'true';
    const emailUsuario = localStorage.getItem('usuarioAtual');

    // --- CONTROLE DO LINK DE CONFIGURAÇÕES NO HEADER ---
    if (menuConfig) {
        if (estaLogado && emailUsuario) {
            menuConfig.style.display = "inline-block"; // Exibe se estiver logado
        } else {
            menuConfig.style.display = "none"; // Oculta se NÃO estiver logado
        }
    }

    // --- CONTROLE DOS BOTÕES DE LOGIN / LOGOUT ---
    if (!authSection) return;

    if (estaLogado && emailUsuario) {
        // CORREÇÃO: Busca a lista central de usuários para encontrar o nome customizado
        const listaUsuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const usuarioLogado = listaUsuarios.find(u => u.email === emailUsuario);
        
        // Se o usuário tiver um nome alterado nas configurações, usa ele. Caso contrário, corta o e-mail.
        const nomeExibicao = (usuarioLogado && usuarioLogado.nome) ? usuarioLogado.nome : emailUsuario.split('@')[0];

        authSection.innerHTML = `
            <div class="user-info">
                <span class="user-logged">
                    Bem-vindo, <strong>${nomeExibicao}</strong>!
                </span>
                <button onclick="logout()" class=\"btn-logout\">
                    Sair
                </button>
            </div>
        `;
    } 
    else {
        // Aponta perfeitamente para o caminho com window.BASE_URL
        authSection.innerHTML = `
            <div class="auth-buttons">
                <a href="${window.BASE_URL}/site/public/pages/login.html" class="btn-login">
                    Entrar
                </a>
                <a href="${window.BASE_URL}/site/public/pages/login.html" class="btn-cadastro">
                    Cadastrar
                </a>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');

    // Redireciona usando a base global limpa
    window.location.href = `${window.BASE_URL}/site/public/pages/index.html`;
}

function redirecionarUsuario() {
    const estaLogado = localStorage.getItem('logado') === 'true';

    if (estaLogado) {
        window.location.href = `${window.BASE_URL}/site/public/pages/redimensionamento_app.html`;
    }
}