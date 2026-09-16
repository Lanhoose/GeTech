import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

document.getElementById('loginForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const usuarioInput = document.getElementById('usuario')?.value || ''.trim().toLowerCase();
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