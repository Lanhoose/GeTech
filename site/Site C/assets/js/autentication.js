import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

async function fazerLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;
  const msg = document.getElementById('mensagem');

  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const snap = await getDoc(doc(db, "usuarios", cred.user.uid));

    if (!snap.exists()) {
      mostrarMensagem(msg, 'Usuário sem permissão cadastrada.', 'erro');
      return;
    }

    const tipo = snap.data().tipo;
    localStorage.setItem('sessaoGeTech', JSON.stringify({ loginAtivo: true, perfil: tipo, email }));
    window.location.href = `${window.BASE_URL}/site/public/pages/redimensionamento_app.html`;
  } catch (e) {
    mostrarMensagem(msg, 'E-mail ou senha incorretos!', 'erro');
  }
}