import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

async function fazerLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const senha = document.getElementById('loginSenha')?.value;
  const msg = document.getElementById('mensagem');
  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const snap = await get(ref(db, `usuarios/${cred.user.uid}`));
    if (!snap.exists()) {
      mostrarMensagem(msg, 'Usuário sem perfil cadastrado.', 'erro');
      return;
    }
    const tipo = (snap.val().tipo || '').toLowerCase();
    window.location.href = `${window.BASE_URL || '/GeTech/site/'}/public/pages/redimensionamento_app.html`;
  } catch (e) {
    console.error(e);
    mostrarMensagem(msg, 'E-mail ou senha incorretos!', 'erro');
  }
}

window.fazerLogin = fazerLogin;
