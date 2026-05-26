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
    
    // CORREÇÃO: Caminho absoluto direto, sem a pasta "public" que estava quebrando
    window.location.href = "/site/pages/public/index.html";
}

function redirecionarUsuario() {
    const estaLogado = localStorage.getItem('logado') === 'true';

    if (estaLogado) {
        // CORREÇÃO: Vai para a área do app (ajuste o final se o arquivo do app não estiver aqui)
        window.location.href = "/site/app/app.html";
    } else {
        // CORREÇÃO: Se não estiver logado, volta para a página inicial/login correta
        window.location.href = "/site/public/pages/index.html";
    }
}

// Executa a verificação assim que o script for carregado
verificarStatusLogin();