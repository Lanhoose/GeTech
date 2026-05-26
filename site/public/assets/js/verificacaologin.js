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
    
    // CORREÇÃO: Adicionada a barra "/" no início para fixar a rota na raiz do GitHub
    window.location.href = "/GeTech/site/public/pages/index.html";
}

function redirecionarUsuario() {
    const estaLogado = localStorage.getItem('logado') === 'true';

    if (estaLogado) {
        // CORREÇÃO: Caminho absoluto a partir da raiz do repositório
        window.location.href = "/GeTech/site/public/pages/site/app/app.html";
    } else {
        // CORREÇÃO: Caminho absoluto para a tela de login
        window.location.href = "/GeTech/site/public/pages/site/login/login.html"; 
        // Nota: Ajuste o final acima se o seu arquivo de login se chamar index.html ou estiver em outra pasta.
    }
}

// Executa a verificação assim que o script for carregado
verificarStatusLogin();