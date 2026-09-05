import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

window.BASE_URL = window.location.origin + "/GeTech/site";

function mostrarMensagem(elemento, texto, tipo) {
    if (!elemento) return;
    elemento.innerText = texto;
    elemento.style.color = tipo === "sucesso" ? "var(--accent-green)" : "#f87171";
}

window.fazerLogin = async function fazerLogin() {
    const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
    const senha = document.getElementById("loginSenha")?.value;
    const msg = document.getElementById("mensagem");
    const botao = document.querySelector("#pane-login .btn-main");

    if (!email || !senha) {
        mostrarMensagem(msg, "Preencha todos os campos do login!", "erro");
        return;
    }

    if (botao) botao.disabled = true;
    if (msg) msg.innerText = "";

    try {
        // A autenticação é feita pela mesma instância Firebase usada pelo Site C.
        const cred = await signInWithEmailAndPassword(auth, email, senha);
        const snap = await get(ref(db, `usuarios/${cred.user.uid}`));

        if (!snap.exists()) {
            mostrarMensagem(msg, "⚠️ Sua conta existe no Firebase Authentication, mas não possui perfil no banco de dados.", "erro");
            return;
        }

        const dados = snap.val();

        // Não criamos uma sessão paralela: Firebase Auth mantém o estado do login.
        mostrarMensagem(msg, "Login realizado com sucesso!", "sucesso");

        setTimeout(() => {
            if ((dados.tipo || "").toLowerCase() === "gestor") {
                window.location.href = `${window.BASE_URL}/../app/app.html`;
            } else {
                window.location.href = `${window.BASE_URL}/pages/index.html`;
            }
        }, 500);

    } catch (erro) {
        console.error("Erro no login:", erro);
        let texto = "⚠️ Não foi possível fazer login. Tente novamente.";

        if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(erro.code)) {
            texto = "❌ E-mail ou senha incorretos.";
        } else if (erro.code === "auth/invalid-email") {
            texto = "❌ E-mail inválido.";
        } else if (erro.code === "auth/too-many-requests") {
            texto = "⚠️ Muitas tentativas. Aguarde um pouco e tente novamente.";
        }

        mostrarMensagem(msg, texto, "erro");
    } finally {
        if (botao) botao.disabled = false;
    }
};

window.cadastrar = async function cadastrar() {
    const email = document.getElementById("cadEmail")?.value.trim().toLowerCase();
    const senha = document.getElementById("cadSenha")?.value;
    const msg = document.getElementById("mensagem-cad");

    if (!email || !senha) {
        mostrarMensagem(msg, "Preencha todos os campos do cadastro!", "erro");
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem(msg, "A senha deve ter pelo menos 6 caracteres.", "erro");
        return;
    }

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, senha);

        // Novo cadastro público recebe perfil comum. Gestor/Patrocinador
        // continua sendo definido pelo banco/perfil administrativo do Site C.
        await set(ref(db, `usuarios/${cred.user.uid}`), {
            email,
            nome: email.split("@")[0],
            tipo: "usuario"
        });

        mostrarMensagem(msg, "Cadastro realizado com sucesso!", "sucesso");

        setTimeout(() => {
            window.location.href = `${window.BASE_URL}/pages/index.html`;
        }, 700);

    } catch (erro) {
        console.error("Erro no cadastro:", erro);

        let texto = "⚠️ Não foi possível concluir o cadastro.";
        if (erro.code === "auth/email-already-in-use") {
            texto = "⚠️ Este e-mail já está cadastrado!";
        } else if (erro.code === "auth/invalid-email") {
            texto = "⚠️ E-mail inválido.";
        } else if (erro.code === "auth/weak-password") {
            texto = "⚠️ Senha muito fraca. Use pelo menos 6 caracteres.";
        }

        mostrarMensagem(msg, texto, "erro");
    }
};

window.togglePasswordVisibility = function togglePasswordVisibility(inputId, buttonElement) {
    const inputField = document.getElementById(inputId);
    if (!inputField) return;

    if (inputField.type === "password") {
        inputField.type = "text";
        buttonElement.textContent = "⊘";
        buttonElement.setAttribute("aria-label", "Esconder senha");
    } else {
        inputField.type = "password";
        buttonElement.textContent = "◉";
        buttonElement.setAttribute("aria-label", "Mostrar senha");
    }
};

// Se o usuário já estiver autenticado pelo Firebase, a tela de login não
// cria outra sessão e pode encaminhá-lo para a área correspondente.
onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        if (!snap.exists()) return;

        const dados = snap.val();
        if ((dados.tipo || "").toLowerCase() === "gestor") {
            // Só redireciona se esta for a página de login.
            if (window.location.pathname.endsWith("/login.html")) {
                window.location.href = `${window.BASE_URL}/../app/app.html`;
            }
        }
    } catch (erro) {
        console.error("Erro ao verificar sessão Firebase:", erro);
    }
});
