// =========================================================
//  verificacaologin.js — integrado ao Firebase Auth + Realtime Database
//  IMPORTANTE: este arquivo precisa ser carregado como módulo:
//  <script type="module" src="/site/public/assets/js/verificacaologin.js"></script>
// =========================================================

import { auth, db } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// Atribuição global segura para evitar o erro "Identifier 'BASE_URL' has already been declared"
window.BASE_URL = window.location.origin + "/GeTech";

// Cache em memória do usuário logado (evita bater no banco toda hora)
let usuarioAtual = null; // { uid, email, tipo, nome }

// =========================================================
//  OUVINTE GLOBAL DE AUTENTICAÇÃO
//  Dispara toda vez que o Firebase confirma se há (ou não)
//  um usuário logado, inclusive ao recarregar a página.
// =========================================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const snap = await get(ref(db, `usuarios/${user.uid}`));
            if (snap.exists()) {
                const dados = snap.val();
                usuarioAtual = {
                    uid: user.uid,
                    email: user.email,
                    tipo: dados.tipo || null,
                    nome: dados.nome || null
                };
            } else {
                // Usuário existe no Authentication mas não tem cadastro de permissão no Realtime Database
                usuarioAtual = { uid: user.uid, email: user.email, tipo: null, nome: null };
            }
        } catch (e) {
            console.error("Erro ao buscar dados do usuário:", e);
            usuarioAtual = { uid: user.uid, email: user.email, tipo: null, nome: null };
        }
    } else {
        usuarioAtual = null;
    }

    // Sempre que o estado de auth mudar, atualiza a interface
    verificarStatusLogin();
});

// =========================================================
//  ATUALIZA A INTERFACE (header) COM BASE NO LOGIN ATUAL
// =========================================================
function verificarStatusLogin() {
    const authSection = document.getElementById('auth-section');
    const menuConfig = document.getElementById('menu-configuracoes');

    const estaLogado = !!usuarioAtual;

    // --- CONTROLE DO LINK DE CONFIGURAÇÕES NO HEADER ---
    if (menuConfig) {
        menuConfig.style.display = estaLogado ? "inline-block" : "none";
    }

    // --- CONTROLE DOS BOTÕES DE LOGIN / LOGOUT ---
    if (!authSection) return;

    if (estaLogado) {
        const nomeExibicao = usuarioAtual.nome
            ? usuarioAtual.nome
            : usuarioAtual.email.split('@')[0];

        authSection.innerHTML = `
            <div class="user-info">
                <span class="user-logged">
                    Bem-vindo, <strong>${nomeExibicao}</strong>!
                </span>
                <button onclick="logout()" class="btn-logout">
                    Sair
                </button>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <div class="auth-buttons">
                <a href="${window.BASE_URL}/site/public/pages/login.html" class="btn-login">
                    Entrar
                </a>
                <a href="${window.BASE_URL}/site/public/pages/login.html" class="btn-cadastro">
                    Cadastrar
                </a>
            </div>
        `;
    }
}

// =========================================================
//  LOGOUT
// =========================================================
async function logout() {
    try {
        await signOut(auth);
    } catch (e) {
        console.error("Erro ao sair:", e);
    } finally {
        usuarioAtual = null;
        window.location.href = `${window.BASE_URL}/site/public/pages/index.html`;
    }
}

// =========================================================
//  REDIRECIONA PARA O APP INTERNO, SE FOR GESTOR
// =========================================================
function redirecionarUsuario() {
    if (usuarioAtual && usuarioAtual.tipo === 'gestor') {
        window.location.href = `${window.BASE_URL}/site/app/app.html`;
    } else {
        alert("Acesso negado. Apenas usuários registrados como Gestor possuem acesso a esta área.");
    }
}

// =========================================================
//  Expõe as funções no escopo global
//  (necessário pois módulos ES não vazam automaticamente
//  para o window, e o HTML usa onclick="logout()" etc.)
// =========================================================
window.verificarStatusLogin = verificarStatusLogin;
window.logout = logout;
window.redirecionarUsuario = redirecionarUsuario;