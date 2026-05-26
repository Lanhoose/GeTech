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
        // CORREÇÃO: Removida a barra inicial e ajustado para o caminho real do GitHub
        authSection.innerHTML = `
            <div class="auth-buttons">
                <a href="pages/login.html" class="btn-login">
                    Entrar
                </a>
                <a href="pages/login.html" class="btn-cadastro">
                    Cadastrar
                </a>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');

    // CORREÇÃO: Caminho relativo voltando pastas se necessário, ou apontando para a raiz relativa
    // Se o logout for chamado a partir da index:
    window.location.href = "index.html"; 
    
    // NOTA: Se o logout puder ser chamado de dentro de subpastas (como /pages/), 
    // o ideal é usar: window.location.origin + "/GeTech/site/index.html" (ajuste conforme sua estrutura real)
}

function redirecionarUsuario() {
    const estaLogado = localStorage.getItem('logado') === 'true';

    // Se a função for executada a partir da raiz (index.html):
    if (estaLogado) {
        window.location.href = "app/app.html"; 
    } else {
        window.location.href = "login.html";
    }
}

document.addEventListener('DOMContentLoaded', verificarStatusLogin);