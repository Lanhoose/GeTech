// =========================================================
// verificacaologin.js
// Fonte de autenticação: o MESMO Firebase Authentication +
// Realtime Database utilizado pelo "Site C".
// Não usa localStorage para decidir se o usuário está logado.
// =========================================================

import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// Raiz do site (SEM barra no final). Todos os destinos abaixo são montados a
// partir dela, para nunca gerar "//" nem apontar para pasta inexistente.
const SITE_ROOT = window.location.origin + "/GeTech/site";
const URL_LOGIN = `${SITE_ROOT}/public/pages/login.html`;
const URL_APP = `${SITE_ROOT}/app/app.html`;

window.BASE_URL = SITE_ROOT;

let usuarioAtual = null;

async function carregarUsuario(user) {
    if (!user) return null;

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const dados = snap.exists() ? snap.val() : {};

        return {
            uid: user.uid,
            email: user.email || "",
            nome: dados.nome || "",
            tipo: (dados.tipo || "").toLowerCase(),
            foto: dados.foto || ""
        };
    } catch (erro) {
        console.error("Erro ao buscar o perfil do usuário:", erro);
        return {
            uid: user.uid,
            email: user.email || "",
            nome: "",
            tipo: "",
            foto: ""
        };
    }
}

async function atualizarInterface(user) {
    usuarioAtual = await carregarUsuario(user);

    const authSection = document.getElementById("auth-section");
    const menuConfig = document.getElementById("menu-configuracoes");

    if (menuConfig) {
        menuConfig.style.display = usuarioAtual ? "inline-block" : "none";
    }

    if (!authSection) return;

    if (usuarioAtual) {
        const nomeExibicao =
            usuarioAtual.nome ||
            usuarioAtual.email.split("@")[0] ||
            "Usuário";

        authSection.innerHTML = `
            <div class="user-info">
                <span class="user-logged">
                    Bem-vindo, <strong>${nomeExibicao}</strong>!
                </span>
                <button type="button" onclick="logout()" class="btn-logout">
                    Sair
                </button>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <div class="auth-buttons">
                <a href="${URL_LOGIN}" class="btn-login">Entrar</a>
                <a href="${URL_LOGIN}" class="btn-cadastro">Cadastrar</a>
            </div>
        `;
    }
}

onAuthStateChanged(auth, async (user) => {
    await atualizarInterface(user);
});

async function logout() {
    // Avisa o protecao-gestor.js que esta saída é intencional, para ele não
    // mostrar "Faça login..." nem disputar o redirecionamento.
    window.__getechSaindo = true;

    try {
        await signOut(auth);
    } catch (erro) {
        console.error("Erro ao sair:", erro);
    }
    usuarioAtual = null;

    // As páginas do public exigem login; depois de sair, vai direto ao login.
    window.location.href = URL_LOGIN;
}

async function redirecionarUsuario() {
    // Aguarda diretamente o estado atual do Firebase.
    const user = auth.currentUser;

    if (!user) {
        window.location.href = URL_LOGIN;
        return;
    }

    const perfil = await carregarUsuario(user);

    if (perfil?.tipo === "gestor") {
        window.location.href = URL_APP;
    } else {
        alert("Acesso negado. Apenas usuários com perfil Gestor possuem acesso ao painel.");
    }
}

window.usuarioAtual = () => usuarioAtual;
window.verificarStatusLogin = () => atualizarInterface(auth.currentUser);
window.logout = logout;
window.redirecionarUsuario = redirecionarUsuario;