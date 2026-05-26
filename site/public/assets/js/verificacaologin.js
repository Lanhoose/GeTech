// Caminho base do seu projeto no GitHub Pages
const BASE_URL = window.location.origin + "/GeTech/site";

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
        // CORREÇÃO: Usando a BASE_URL para garantir o caminho correto de qualquer lugar
        authSection.innerHTML = `
            <div class="auth-buttons">
                <a href="${BASE_URL}/public/pages/login.html" class="btn-login">
                    Entrar
                </a>
                <a href="${BASE_URL}/public/pages/login.html" class="btn-cadastro">
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

    // CORREÇÃO: Redireciona para a página inicial independente de onde o usuário estiver
    window.location.href = `${BASE_URL}/public/index.html`;
}

function redirecionarUsuario() {
    const estaLogado = localStorage.getItem('logado') === 'true';

    if (estaLogado) {
        // Área principal do sistema
        window.location.href = `${BASE_URL}/app/app.html`;
    } else {
        // Página de login
        window.location.href = `${BASE_URL}/public/pages/login.html`;
    }
}

// Executa automaticamente ao carregar a página
document.addEventListener('DOMContentLoaded', verificarStatusLogin);