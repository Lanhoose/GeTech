function verificarStatusLogin() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    const estaLogado = localStorage.getItem('logado') === 'true';
    const emailUsuario = localStorage.getItem('usuarioAtual');

    if (estaLogado && emailUsuario) {
        const nomeExibicao = emailUsuario.split('@')[0];

        authSection.innerHTML = `
            <div class="user-info">
                <span class="user-logged">Bem-vindo, <strong>${nomeExibicao}</strong>!</span>
                <button onclick="logout()" class="btn-logout">Sair</button>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');
    
    // Força a URL a resetar a partir da raiz do GitHub, limpando caminhos antigos
    window.location.href = "../../../public/pages/index.html";
}

function redirecionarUsuario() {
    const estaLogado = localStorage.getItem('logado') === 'true';

    if (estaLogado) {
        // CORREÇÃO: Força o caminho limpo direto para o app, sem acumular pastas
        window.location.href = "../../../app/app.html";
    } else {
        // CORREÇÃO: Força o caminho limpo direto para o login
        window.location.href = "../../../public/pages/index.html";
    }
}

// Executa a verificação assim que o script for carregado
verificarStatusLogin();