function verificarStatusLogin() {
    const authSection = document.getElementById('auth-section');

    // Se a seção não existir, interrompe
    if (!authSection) return;

    const estaLogado = localStorage.getItem('logado') === 'true';
    const emailUsuario = localStorage.getItem('usuarioAtual');

    // Usuário logado
    if (estaLogado && emailUsuario) {
        const nomeExibicao = emailUsuario.split('@')[0];

        authSection.innerHTML = `
            <div class="user-info">
                <span class="user-logged">
                    Bem-vindo, <strong>${nomeExibicao}</strong>!
                </span>

                <button onclick="logout()" class="btn-logout">
                    Sair
                </button>
            </div>
        `;
    } 
    // Usuário deslogado
    else {
        authSection.innerHTML = `
            <div class="auth-buttons">

                <a href="/GeTech/site/public/pages/login.html" class="btn-login">
                    Entrar
                </a>

                <a href="/GeTech/site/public/pages/cadastro.html" class="btn-cadastro">
                    Cadastrar
                </a>

            </div>
        `;
    }
}

function logout() {

    // Remove dados do usuário
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');

    // Redireciona para a página inicial
    window.location.href = "/GeTech/";
}

function redirecionarUsuario() {

    const estaLogado = localStorage.getItem('logado') === 'true';

    if (estaLogado) {

        // Área principal do sistema
        window.location.href = "/GeTech/site/app/app.html";

    } else {

        // Página de login
        window.location.href = "/GeTech/site/pages/login.html";
    }
}

// Executa automaticamente ao carregar a página
document.addEventListener('DOMContentLoaded', verificarStatusLogin);