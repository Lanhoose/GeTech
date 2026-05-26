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

    window.location.href = "/GeTech/site/pages/index.html";
}

function redirecionarUsuario() {
    const estaLogado = localStorage.getItem('logado') === 'true';

    if (estaLogado) {
        window.location.href = "/GeTech/site/app/app.html";
    } else {
        window.location.href = "/GeTech/site/pages/index.html";
    }
}

// Executa a verificação assim que o script for carregado
verificarStatusLogin();