import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';
import { registrarAuditoria } from '../../../app/assets/js/auditoria.js';

window.BASE_URL = window.location.origin + '/GeTech';
let usuarioAtual = null;
let perfilAtual = {};

function mostrarFeedback(elementoId, mensagem, tipo = 'sucesso') {
    const el = document.getElementById(elementoId);
    if (!el) return;
    el.textContent = mensagem;
    el.className = `feedback-msg ${tipo}`;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
        el.textContent = '';
        el.className = 'feedback-msg';
    }, 4000);
}
window.mostrarFeedback = mostrarFeedback;

async function inicializarDadosUsuario(user = auth.currentUser) {
    if (!user) {
        alert('Acesso restrito! Por favor, faça login para acessar as configurações.');
        window.location.href = `${window.BASE_URL}/site/public/pages/login.html`;
        return false;
    }

    usuarioAtual = user;
    const snap = await get(ref(db, `usuarios/${user.uid}`));
    perfilAtual = snap.exists() ? snap.val() : {};

    const inputEmail = document.getElementById('conf-email');
    const inputNome = document.getElementById('conf-nome');
    if (inputEmail) inputEmail.value = user.email || perfilAtual.email || '';
    if (inputNome) inputNome.value = perfilAtual.nome || user.displayName || (user.email || '').split('@')[0];

    return true;
}

function configurarAbas() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const configPanes = document.querySelectorAll('.config-pane');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            configPanes.forEach(pane => pane.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`tab-${targetTab}`)?.classList.add('active');
        });
    });
}

async function salvarPerfil() {
    if (!usuarioAtual) return;

    const nome = document.getElementById('conf-nome')?.value.trim();
    const novoEmail = document.getElementById('conf-email')?.value.trim();
    const emailAtual = usuarioAtual.email;
    const btn = document.getElementById('btn-salvar-perfil');

    if (!nome || !novoEmail) {
        mostrarFeedback('feedback-perfil', '⚠️ Preencha o Nome e o E-mail antes de salvar.', 'erro');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
        mostrarFeedback('feedback-perfil', '⚠️ Informe um e-mail válido.', 'erro');
        return;
    }

    if (btn) {
        btn.textContent = 'Salvando...';
        btn.disabled = true;
    }

    try {
        if (novoEmail !== emailAtual) {
            try {
                await updateEmail(usuarioAtual, novoEmail);
            } catch (erroEmail) {
                if (erroEmail.code === 'auth/requires-recent-login') {
                    mostrarFeedback('feedback-perfil', '⚠️ Por segurança, faça login novamente antes de alterar o e-mail.', 'erro');
                } else if (erroEmail.code === 'auth/email-already-in-use') {
                    mostrarFeedback('feedback-perfil', '⚠️ Este novo e-mail já está em uso por outra conta.', 'erro');
                } else {
                    throw erroEmail;
                }
                return;
            }
        }

        await update(ref(db, `usuarios/${usuarioAtual.uid}`), {
            nome,
            email: novoEmail,
            atualizadoEm: Date.now()
        });

        await registrarAuditoria('Configurações: perfil atualizado', `Perfil alterado para ${nome} / ${novoEmail}.`, 'info');
        perfilAtual = { ...perfilAtual, nome, email: novoEmail };
        const strongUser = document.querySelector('.user-logged strong');
        if (strongUser) strongUser.textContent = nome;
        mostrarFeedback('feedback-perfil', '✅ Perfil atualizado com sucesso!', 'sucesso');
    } catch (erro) {
        console.error(erro);
        mostrarFeedback('feedback-perfil', `❌ Não foi possível atualizar o perfil: ${erro.message}`, 'erro');
    } finally {
        if (btn) {
            btn.textContent = 'Salvar Alterações';
            btn.disabled = false;
        }
    }
}

async function alterarSenha() {
    if (!usuarioAtual) return;

    const senhaAtual = document.getElementById('senha-atual')?.value;
    const novaSenha = document.getElementById('nova-senha')?.value;
    const confirmaSenha = document.getElementById('confirma-senha')?.value;
    const btn = document.getElementById('btn-salvar-senha');

    if (!senhaAtual || !novaSenha || !confirmaSenha) {
        mostrarFeedback('feedback-senha', '⚠️ Preencha todos os campos de senha.', 'erro');
        return;
    }
    if (novaSenha.length < 6) {
        mostrarFeedback('feedback-senha', '⚠️ A nova senha deve ter no mínimo 6 caracteres.', 'erro');
        return;
    }
    if (novaSenha !== confirmaSenha) {
        mostrarFeedback('feedback-senha', '⚠️ A confirmação não coincide com a nova senha.', 'erro');
        return;
    }
    if (!usuarioAtual.email) {
        mostrarFeedback('feedback-senha', '❌ Sua conta não possui e-mail para reautenticação.', 'erro');
        return;
    }

    if (btn) {
        btn.textContent = 'Alterando...';
        btn.disabled = true;
    }

    try {
        const credencial = EmailAuthProvider.credential(usuarioAtual.email, senhaAtual);
        await reauthenticateWithCredential(usuarioAtual, credencial);
        await updatePassword(usuarioAtual, novaSenha);
        await registrarAuditoria('Configurações: senha alterada', 'Senha da conta alterada com sucesso.', 'warning');

        document.getElementById('senha-atual').value = '';
        document.getElementById('nova-senha').value = '';
        document.getElementById('confirma-senha').value = '';
        mostrarFeedback('feedback-senha', '✅ Senha alterada com sucesso!', 'sucesso');
    } catch (erro) {
        console.error(erro);
        let mensagem = '❌ Não foi possível alterar a senha.';
        if (erro.code === 'auth/invalid-credential' || erro.code === 'auth/wrong-password') {
            mensagem = '❌ A senha atual informada está incorreta.';
        } else if (erro.code === 'auth/requires-recent-login') {
            mensagem = '⚠️ Por segurança, faça login novamente e tente alterar a senha.';
        } else if (erro.code === 'auth/weak-password') {
            mensagem = '⚠️ A nova senha não atende aos requisitos mínimos do Firebase.';
        }
        mostrarFeedback('feedback-senha', mensagem, 'erro');
    } finally {
        if (btn) {
            btn.textContent = 'Atualizar Senha';
            btn.disabled = false;
        }
    }
}

function togglePasswordVisibility(inputId, buttonElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        buttonElement.textContent = '⊘';
        buttonElement.setAttribute('aria-label', 'Esconder senha');
    } else {
        input.type = 'password';
        buttonElement.textContent = '◉';
        buttonElement.setAttribute('aria-label', 'Mostrar senha');
    }
}
window.togglePasswordVisibility = togglePasswordVisibility;

async function iniciar() {
    configurarAbas();
    document.getElementById('btn-salvar-perfil')?.addEventListener('click', salvarPerfil);
    document.getElementById('btn-salvar-senha')?.addEventListener('click', alterarSenha);
    await inicializarDadosUsuario();
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert('Acesso restrito! Por favor, faça login para acessar as configurações.');
        window.location.href = `${window.BASE_URL}/site/public/pages/login.html`;
        return;
    }
    await inicializarDadosUsuario(user);
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(iniciar, 50);
});
