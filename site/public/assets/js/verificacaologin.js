// Captura dinamicamente 'https://jose-c-web.github.io' (ou 'http://127.0.0.1:5500') 
// e adiciona apenas o nome do repositório correto.
const BASE_URL = window.location.origin + "/GeTech";

function verificarStatusLogin() {
    const authSection = document.getElementById('auth-section');

    if (!authSection) return;

    const estaLogado = localStorage.getItem('logado') === 'true';
    const emailUsuario = localStorage.getItem('usuarioAtual');

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
    else {
        // Aponta perfeitamente para: /GeTech/site/public/pages/login.html
        authSection.innerHTML = `
            <div class="auth-buttons">
                <a href="${BASE_URL}/site/public/pages/login.html" class="btn-login">
                    Entrar
                </a>
                <a href="${BASE_URL}/site/public/pages/login.html" class="btn-cadastro">
                    Cadastrar
                </a>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');

    // Redireciona para o index.html que está na raiz do repositório (/GeTech/index.html)
    window.location.href = `${BASE_URL}/index.html`;
}

function redirecionarUsuario() {
    const estaLogado = localStorage.getItem('logado') === 'true';

    if (estaLogado) {
        // Ajuste aqui o caminho da sua pasta 'app' se ela estiver dentro de 'site/' ou na raiz
        window.location.href = `${BASE_URL}/site/app/app.html`;
    } else {
        window.location.href = `${BASE_URL}/site/public/pages/login.html`;
    }
}

document.addEventListener('DOMContentLoaded', verificarStatusLogin);