import { auth, db } from "./firebase-config.js";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// E-mails de recuperação enviados em português.
auth.languageCode = "pt-BR";

// =========================================================
//  LOGIN
// =========================================================
document.getElementById('loginForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const usuarioInput = (document.getElementById('usuario')?.value || '').trim().toLowerCase();
    const senhaInput = document.getElementById('senha')?.value || '';
    const msg = document.getElementById('mensagem');

    if (msg) msg.textContent = '';
    if (submitBtn) submitBtn.disabled = true;

    try {
        // 1. Autentica no Firebase
        const cred = await signInWithEmailAndPassword(auth, usuarioInput, senhaInput);
        const uid = cred.user.uid;

        // 2. Busca o perfil no Realtime Database
        const snap = await get(ref(db, `usuarios/${uid}`));

        if (!snap.exists()) {
            if (msg) { msg.textContent = "⚠️ Este usuário não possui perfil cadastrado. Contate o administrador."; msg.style.color = '#f87171'; }
            return;
        }

        const usuarioEncontrado = snap.val();

        // 3. Redirecionamento por tipo
        if (usuarioEncontrado.tipo === 'gestor') {
            alert(`✅ Bem-vindo, Gestor ${usuarioEncontrado.nome}! Entrando no sistema administrativo...`);
            window.location.href = "sistema.html";
        } else if (usuarioEncontrado.tipo === 'patrocinador') {
            alert(`✅ Bem-vindo, ${usuarioEncontrado.nome}! Entrando no painel de patrocinador...`);
            window.location.href = "patrocinadores.html";
        } else {
            alert(`✅ Login efetuado com sucesso! Olá, ${usuarioEncontrado.nome}.`);
            window.location.href = "index.html";
        }

    } catch (erro) {
        console.error("Erro no login:", erro);
        let texto = "⚠️ Não foi possível fazer login. Tente novamente.";
        if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(erro.code)) {
            texto = "❌ E-mail ou senha incorretos. Tente novamente.";
        } else if (erro.code === 'auth/invalid-email') {
            texto = "❌ E-mail inválido.";
        } else if (erro.code === 'auth/too-many-requests') {
            texto = "⚠️ Muitas tentativas. Aguarde um pouco antes de tentar novamente.";
        }
        if (msg) { msg.textContent = texto; msg.style.color = '#f87171'; } else { alert(texto); }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});

// =========================================================
//  RECUPERAÇÃO DE SENHA ("Esqueceu a senha?")
//  Usa o Firebase Authentication: ele gera o link seguro e envia o e-mail.
// =========================================================
const linkEsqueceu = document.getElementById('linkEsqueceuSenha');
const modal = document.getElementById('modalRecuperarSenha');
const formRecuperar = document.getElementById('formRecuperarSenha');
const inputEmailRec = document.getElementById('emailRecuperacao');
const msgRec = document.getElementById('mensagemRecuperacao');
const btnEnviarRec = document.getElementById('btnEnviarRecuperacao');
const TEXTO_BOTAO_ENVIAR = 'Enviar link de redefinição';
const ESPERA_REENVIO_SEGUNDOS = 60;

let temporizadorReenvio = null;

function mostrarMsgRecuperacao(texto, tipo) {
    if (!msgRec) return;
    msgRec.textContent = texto;
    msgRec.style.color = tipo === 'sucesso' ? '#16a34a' : '#f87171';
}

function abrirModalRecuperacao(evento) {
    evento?.preventDefault();
    if (!modal) return;

    // Aproveita o e-mail que a pessoa já digitou no login.
    const emailDigitado = (document.getElementById('usuario')?.value || '').trim();
    if (inputEmailRec && !inputEmailRec.value) inputEmailRec.value = emailDigitado;

    mostrarMsgRecuperacao('', 'erro');
    modal.classList.add('aberto');
    setTimeout(() => inputEmailRec?.focus(), 50);
}

function fecharModalRecuperacao() {
    modal?.classList.remove('aberto');
    linkEsqueceu?.focus();
}

// Bloqueia o botão por alguns segundos após o envio (evita "too-many-requests").
function iniciarEsperaReenvio() {
    if (!btnEnviarRec) return;
    let restante = ESPERA_REENVIO_SEGUNDOS;
    btnEnviarRec.disabled = true;
    btnEnviarRec.textContent = `Reenviar em ${restante}s`;

    clearInterval(temporizadorReenvio);
    temporizadorReenvio = setInterval(() => {
        restante -= 1;
        if (restante <= 0) {
            clearInterval(temporizadorReenvio);
            btnEnviarRec.disabled = false;
            btnEnviarRec.textContent = TEXTO_BOTAO_ENVIAR;
        } else {
            btnEnviarRec.textContent = `Reenviar em ${restante}s`;
        }
    }, 1000);
}

async function enviarEmailRecuperacao(email) {
    // Depois de redefinir, o Firebase mostra um botão para voltar a esta página.
    const configuracao = {
        url: window.location.origin + window.location.pathname,
        handleCodeInApp: false
    };

    try {
        await sendPasswordResetEmail(auth, email, configuracao);
    } catch (erro) {
        // Se o domínio ainda não estiver em Authentication > Configurações >
        // Domínios autorizados, envia sem o link de retorno.
        if (erro.code === 'auth/unauthorized-continue-uri' || erro.code === 'auth/invalid-continue-uri') {
            await sendPasswordResetEmail(auth, email);
        } else {
            throw erro;
        }
    }
}

linkEsqueceu?.addEventListener('click', abrirModalRecuperacao);
document.getElementById('fecharRecuperarSenha')?.addEventListener('click', fecharModalRecuperacao);
document.getElementById('btnCancelarRecuperacao')?.addEventListener('click', fecharModalRecuperacao);

// Clicar fora do cartão fecha o modal.
modal?.addEventListener('click', (evento) => {
    if (evento.target === modal) fecharModalRecuperacao();
});

// Esc fecha o modal.
document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modal?.classList.contains('aberto')) fecharModalRecuperacao();
});

formRecuperar?.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const email = (inputEmailRec?.value || '').trim().toLowerCase();

    if (!email) {
        mostrarMsgRecuperacao('❌ Informe o e-mail da sua conta.', 'erro');
        return;
    }

    if (btnEnviarRec) {
        btnEnviarRec.disabled = true;
        btnEnviarRec.textContent = 'Enviando...';
    }
    mostrarMsgRecuperacao('', 'erro');

    try {
        await enviarEmailRecuperacao(email);

        // Mensagem neutra de propósito: não revela se o e-mail existe ou não.
        mostrarMsgRecuperacao(
            '✅ Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha. Verifique também o spam.',
            'sucesso'
        );
        iniciarEsperaReenvio();

    } catch (erro) {
        console.error('Erro ao enviar e-mail de recuperação:', erro);

        let texto = '⚠️ Não foi possível enviar o e-mail. Tente novamente.';
        let liberarBotao = true;

        if (erro.code === 'auth/invalid-email') {
            texto = '❌ E-mail inválido.';
        } else if (erro.code === 'auth/user-not-found') {
            // Mesma resposta do caso de sucesso (evita descobrir e-mails cadastrados).
            mostrarMsgRecuperacao(
                '✅ Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha. Verifique também o spam.',
                'sucesso'
            );
            iniciarEsperaReenvio();
            return;
        } else if (erro.code === 'auth/too-many-requests') {
            texto = '⚠️ Muitas tentativas. Aguarde alguns minutos e tente novamente.';
        } else if (erro.code === 'auth/network-request-failed') {
            texto = '⚠️ Sem conexão. Verifique sua internet e tente novamente.';
        }

        mostrarMsgRecuperacao(texto, 'erro');

        if (liberarBotao && btnEnviarRec) {
            btnEnviarRec.disabled = false;
            btnEnviarRec.textContent = TEXTO_BOTAO_ENVIAR;
        }
    }
});