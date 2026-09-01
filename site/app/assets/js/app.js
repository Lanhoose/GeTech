// ==========================================================================
// app.js — Painel ERP
// A autenticação é a mesma do "Site C":
// Firebase Authentication + Realtime Database.
// ==========================================================================

import { auth, db } from "../../Site C/assets/js/firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

window.BASE_URL = window.location.origin + "/GeTech/site";

// ==========================================================================
// TEMA
// ==========================================================================
(function () {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
})();

// ==========================================================================
// AUTENTICAÇÃO — Firebase é a fonte da verdade
// ==========================================================================
let usuarioAtual = null;
let authInicializado = false;

async function obterPerfil(user) {
    if (!user) return null;

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));

        if (!snap.exists()) {
            return {
                uid: user.uid,
                email: user.email || "",
                nome: "",
                tipo: ""
            };
        }

        const dados = snap.val();

        return {
            uid: user.uid,
            email: user.email || dados.email || "",
            nome: dados.nome || "",
            tipo: (dados.tipo || "").toLowerCase(),
            foto: dados.foto || ""
        };
    } catch (erro) {
        console.error("Erro ao consultar o perfil no Realtime Database:", erro);
        return null;
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = `${window.BASE_URL}/pages/login.html`;
        return;
    }

    usuarioAtual = await obterPerfil(user);

    if (!usuarioAtual || usuarioAtual.tipo !== "gestor") {
        alert("Acesso restrito. Apenas usuários com perfil Gestor podem acessar o painel.");
        await signOut(auth).catch(() => {});
        window.location.href = `${window.BASE_URL}/pages/index.html`;
        return;
    }

    authInicializado = true;
    atualizarUsuarioNaTela();
});

function atualizarUsuarioNaTela() {
    const elementoUsuario = document.getElementById("usuario");
    if (!elementoUsuario || !usuarioAtual) return;

    const nomeExibicao =
        usuarioAtual.nome ||
        usuarioAtual.email.split("@")[0] ||
        "Usuário";

    elementoUsuario.textContent = `Bem-vindo, ${nomeExibicao}!`;
}

// ==========================================================================
// LOGOUT — encerra a sessão real do Firebase
// ==========================================================================
window.logout = async function logout() {
    try {
        await signOut(auth);
    } catch (erro) {
        console.error("Erro ao sair:", erro);
    } finally {
        window.location.href = `${window.BASE_URL}/pages/index.html`;
    }
};

// ==========================================================================
// NAVEGAÇÃO PARA MÓDULOS
// ==========================================================================
window.abrirModulo = function abrirModulo(nome) {
    if (!authInicializado || !usuarioAtual || usuarioAtual.tipo !== "gestor") {
        alert("Acesso restrito. Faça login como Gestor.");
        return;
    }

    window.location.href = "modules/" + nome + "/" + nome + ".html";
};

// ==========================================================================
// TOGGLE DE TEMA
// ==========================================================================
function inicializarToggleTema() {
    const btn = document.getElementById("themeToggle");
    const icon = document.getElementById("themeIcon");
    if (!btn) return;

    const aplicarTema = (tema) => {
        document.documentElement.setAttribute("data-theme", tema);
        localStorage.setItem("theme", tema);

        if (icon) {
            icon.textContent = tema === "dark" ? "🌙" : "☀️";
        }

        btn.setAttribute(
            "aria-label",
            tema === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
        );
    };

    aplicarTema(localStorage.getItem("theme") || "dark");

    btn.addEventListener("click", () => {
        const atual = document.documentElement.getAttribute("data-theme");
        aplicarTema(atual === "dark" ? "light" : "dark");
    });
}

document.addEventListener("DOMContentLoaded", inicializarToggleTema);
