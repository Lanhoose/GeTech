function verificarStatusLogin() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    const estaLogado = localStorage.getItem('logado') === 'true';
    const emailUsuario = localStorage.getItem('usuarioAtual'); // Pegamos o e-mail logado

    if (estaLogado && emailUsuario) {
        // Pega a parte antes do @ para usar como nome, caso seja um e-mail
        const nomeExibicao = emailUsuario.split('@')[0];

        // Usando as classes CSS que definimos para manter o estilo moderno
        authSection.innerHTML = `
            <div class="user-info">
                <span class="user-logged">Bem-vindo, <strong>${nomeExibicao}</strong>!</span>
                <button onclick="logout()" class="btn-logout">Sair</button>
            </div>
        `;
    }
}

function logout() {
    // Limpamos os dados de sessão
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');
    
    // Em vez de apenas recarregar, é melhor mandar para a home pública
    window.location.href = "/site/public/pages/index.html";
}

function redirecionarUsuario() {
    const estaLogado = localStorage.getItem('logado') === 'true';

    if (estaLogado) {
        // Se estiver logado, vai para a área restrita
        window.location.href = "/site/app/app.html";
    } else {
        // Se não estiver logado, vai para a tela de login
        // Ajustei o caminho para o que costuma ser o padrão de pastas
        window.location.href = "/site/public/pages/login.html";
    }
}

// Executa a verificação assim que o script for carregado
verificarStatusLogin();