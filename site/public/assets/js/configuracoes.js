document.addEventListener("DOMContentLoaded", () => {
     const sessao = JSON.parse(localStorage.getItem('sessaoGeTech'));
    const BASE_URL = window.location.origin + "/GeTech";

    // Se não houver sessão, se não estiver ativo, ou se o perfil NÃO for gestor
    if (!sessao || !sessao.loginAtivo || sessao.perfil !== 'gestor') {
        alert("Acesso restrito. Apenas gestores podem acessar este painel.");
        // Redireciona para a página de login
        window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
        return; // Para a execução do resto do script
    }
});

// Atribuição global segura para evitar o erro "Identifier 'BASE_URL' has already been declared"
window.BASE_URL = window.location.origin + "/GeTech";

// ── HELPERS ──────────────────────────────────────────────────────────────────

// Exibe mensagem de feedback inline no lugar dos alert() bloqueantes
function mostrarFeedback(elementoId, mensagem, tipo = 'sucesso') {
    const el = document.getElementById(elementoId);
    if (!el) return;
    el.textContent = mensagem;
    el.className = `feedback-msg ${tipo}`;
    // Some após 4 segundos
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.textContent = ''; el.className = 'feedback-msg'; }, 4000);
}

// ── INICIALIZAÇÃO DE DADOS DO USUÁRIO ────────────────────────────────────────
function inicializarDadosUsuario() {
    const estaLogado   = localStorage.getItem('logado') === 'true';
    const emailUsuario = localStorage.getItem('usuarioAtual');

    if (!estaLogado || !emailUsuario) {
        alert("Acesso restrito! Por favor, faça login para acessar as configurações.");
        window.location.href = `${window.BASE_URL}/site/public/pages/login.html`;
        return false;
    }

    // Preenche e-mail sempre com o valor real da sessão
    const inputEmail = document.getElementById('conf-email');
    if (inputEmail) inputEmail.value = emailUsuario;

    // Lógica Corrigida: Busca o usuário dentro da lista 'usuarios' compartilhada
    const inputNome = document.getElementById('conf-nome');
    if (inputNome) {
        const listaUsuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const usuarioEncontrado = listaUsuarios.find(u => u.email === emailUsuario);

        if (usuarioEncontrado && usuarioEncontrado.nome) {
            inputNome.value = usuarioEncontrado.nome;
        } else {
            // Fallback se não possuir nome salvo ainda
            inputNome.value = emailUsuario.split('@')[0];
        }
    }

    return true;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Pequeno delay para garantir injeção dos componentes header/footer
    setTimeout(() => { inicializarDadosUsuario(); }, 50);

    // ── ALTERNÂNCIA DE ABAS ──────────────────────────────────────────────────
    const tabButtons  = document.querySelectorAll('.tab-btn');
    const configPanes = document.querySelectorAll('.config-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            tabButtons.forEach(btn  => btn.classList.remove('active'));
            configPanes.forEach(pane => pane.classList.remove('active'));
            button.classList.add('active');
            const activePane = document.getElementById(`tab-${targetTab}`);
            if (activePane) activePane.classList.add('active');
        });
    });

    // ── SALVAR PERFIL ────────────────────────────────────────────────────────
    const btnSalvarPerfil = document.getElementById('btn-salvar-perfil');
    if (btnSalvarPerfil) {
        btnSalvarPerfil.addEventListener('click', () => {
            const nome       = document.getElementById('conf-nome').value.trim();
            const emailAntigo = localStorage.getItem('usuarioAtual');
            const novoEmail  = document.getElementById('conf-email').value.trim();

            if (!nome || !novoEmail) {
                mostrarFeedback('feedback-perfil', '⚠️ Preencha o Nome e o E-mail antes de salvar.', 'erro');
                return;
            }

            btnSalvarPerfil.textContent = 'Salvando...';
            btnSalvarPerfil.disabled    = true;

            setTimeout(() => {
                let listaUsuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                let index = listaUsuarios.findIndex(u => u.email === emailAntigo);

                if (index !== -1) {
                    // Atualiza os dados no banco central
                    listaUsuarios[index].nome = nome;
                    
                    if (emailAntigo !== novoEmail) {
                        // Verifica se o novo e-mail já pertence a outro usuário
                        const emailDuplicado = listaUsuarios.find(u => u.email === novoEmail);
                        if (emailDuplicado) {
                            mostrarFeedback('feedback-perfil', '⚠️ Este novo e-mail já está em uso por outra conta.', 'erro');
                            btnSalvarPerfil.textContent = 'Salvar Alterações';
                            btnSalvarPerfil.disabled    = false;
                            return;
                        }
                        listaUsuarios[index].email = novoEmail;
                        localStorage.setItem('usuarioAtual', novoEmail);
                    }
                    
                    localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));
                }

                // Atualiza o nome exibido no header de forma dinâmica e persistente
                const strongUser = document.querySelector('.user-logged strong');
                if (strongUser) strongUser.textContent = nome;

                mostrarFeedback('feedback-perfil', '✅ Perfil atualizado com sucesso!', 'sucesso');
                btnSalvarPerfil.textContent = 'Salvar Alterações';
                btnSalvarPerfil.disabled    = false;
            }, 800);
        });
    }

    // ── ATUALIZAR SENHA ──────────────────────────────────────────────────────
    const btnSalvarSenha = document.getElementById('btn-salvar-senha');
    if (btnSalvarSenha) {
        btnSalvarSenha.addEventListener('click', () => {
            const emailUsuario  = localStorage.getItem('usuarioAtual');
            const senhaAtual    = document.getElementById('senha-atual').value;
            const novaSenha     = document.getElementById('nova-senha').value;
            const confirmaSenha = document.getElementById('confirma-senha').value;

            if (!senhaAtual || !novaSenha || !confirmaSenha) {
                mostrarFeedback('feedback-senha', '⚠️ Preencha todos os campos de senha.', 'erro');
                return;
            }

            let listaUsuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            let index = listaUsuarios.findIndex(u => u.email === emailUsuario);

            if (index === -1) {
                mostrarFeedback('feedback-senha', '❌ Erro ao localizar sua conta. Faça login novamente.', 'erro');
                return;
            }

            if (listaUsuarios[index].senha !== senhaAtual) {
                mostrarFeedback('feedback-senha', '❌ A senha atual informada está incorreta.', 'erro');
                return;
            }

            if (novaSenha.length < 6) { // Igualado aos 6 caracteres mínimos definidos no cadastro
                mostrarFeedback('feedback-senha', '⚠️ A nova senha deve ter no mínimo 6 caracteres.', 'erro');
                return;
            }

            if (novaSenha !== confirmaSenha) {
                mostrarFeedback('feedback-senha', '⚠️ A confirmação não coincide com a nova senha.', 'erro');
                return;
            }

            btnSalvarSenha.textContent = 'Alterando...';
            btnSalvarSenha.disabled    = true;

            setTimeout(() => {
                // Atualiza a senha no objeto interno correto do banco central
                listaUsuarios[index].senha = novaSenha;
                localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));

                document.getElementById('senha-atual').value   = '';
                document.getElementById('nova-senha').value    = '';
                document.getElementById('confirma-senha').value = '';

                mostrarFeedback('feedback-senha', '✅ Senha alterada com sucesso!', 'sucesso');
                btnSalvarSenha.textContent = 'Atualizar Senha';
                btnSalvarSenha.disabled    = false;
            }, 1000);
        });
    }
});

// ==========================================
// FUNÇÃO PARA MOSTRAR / ESCONDER SENHA
// ==========================================
function togglePasswordVisibility(inputId, buttonElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        buttonElement.textContent = "⊘"; // Muda o ícone quando está visível
        buttonElement.setAttribute('aria-label', 'Esconder senha');
    } else {
        input.type = "password";
        buttonElement.textContent = "◉"; // Volta para o olho quando oculta
        buttonElement.setAttribute('aria-label', 'Mostrar senha');
    }
}