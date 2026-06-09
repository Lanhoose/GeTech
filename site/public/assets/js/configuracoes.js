// Captura dinamicamente a URL base do projeto no GitHub Pages ou Localhost
const BASE_URL = window.location.origin + "/GeTech";

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
        window.location.href = `${BASE_URL}/site/public/pages/login.html`;
        return false;
    }

    // Preenche e-mail sempre com o valor real da sessão
    const inputEmail = document.getElementById('conf-email');
    if (inputEmail) inputEmail.value = emailUsuario;

    // FIX: lê o nome salvo do objeto do usuário no localStorage; só usa fallback
    // do prefixo do e-mail se nunca tiver sido salvo um nome antes.
    const inputNome = document.getElementById('conf-nome');
    if (inputNome) {
        const dadosSalvos = localStorage.getItem(emailUsuario);
        if (dadosSalvos) {
            try {
                const obj = JSON.parse(dadosSalvos);
                // Usa o nome salvo se existir; caso contrário deriva do e-mail
                inputNome.value = obj.nome || emailUsuario.split('@')[0];
            } catch (e) {
                inputNome.value = emailUsuario.split('@')[0];
            }
        } else {
            // Usuário existe na sessão mas ainda não tem objeto salvo
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
                // FIX: persiste o nome no objeto do usuário
                const dadosSalvos = localStorage.getItem(emailAntigo);
                let obj = dadosSalvos ? JSON.parse(dadosSalvos) : {};
                obj.nome = nome;

                if (emailAntigo && emailAntigo !== novoEmail) {
                    // Migra o cadastro completo para a nova chave de e-mail
                    obj.email = novoEmail;
                    localStorage.setItem(novoEmail, JSON.stringify(obj));
                    localStorage.removeItem(emailAntigo);
                    localStorage.setItem('usuarioAtual', novoEmail);
                } else {
                    localStorage.setItem(emailAntigo, JSON.stringify(obj));
                }

                // Atualiza o nome exibido no header dinamicamente
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

            const dadosSalvos = localStorage.getItem(emailUsuario);
            if (!dadosSalvos) {
                mostrarFeedback('feedback-senha', '❌ Erro ao localizar sua conta. Faça login novamente.', 'erro');
                return;
            }

            const obj = JSON.parse(dadosSalvos);

            if (obj.senha !== senhaAtual) {
                mostrarFeedback('feedback-senha', '❌ A senha atual informada está incorreta.', 'erro');
                return;
            }

            if (novaSenha.length < 8) {
                mostrarFeedback('feedback-senha', '⚠️ A nova senha deve ter no mínimo 8 caracteres.', 'erro');
                return;
            }

            if (novaSenha !== confirmaSenha) {
                mostrarFeedback('feedback-senha', '⚠️ A confirmação não coincide com a nova senha.', 'erro');
                return;
            }

            btnSalvarSenha.textContent = 'Alterando...';
            btnSalvarSenha.disabled    = true;

            setTimeout(() => {
                obj.senha = novaSenha;
                localStorage.setItem(emailUsuario, JSON.stringify(obj));

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