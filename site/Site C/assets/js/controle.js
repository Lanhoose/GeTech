// =========================================================
//  controle.js — agora identifica o usuário via Firebase Auth
//  + Realtime Database, em vez de confiar apenas no localStorage.
//
//  IMPORTANTE: precisa ser carregado como módulo:
//  <script type="module" src="../assets/js/controle.js"></script>
// =========================================================

import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

document.addEventListener("DOMContentLoaded", function () {

    // Elementos da interface
    const itensGestor = document.querySelectorAll('.restrito.gestor');
    const itensPatrocinador = document.querySelectorAll('.restrito.patrocinador');
    const avatarImg = document.getElementById('avatarUsuario');
    const botaoSairContainer = document.getElementById('menuSair');
    const botaoSairLink = document.getElementById('btnSair');

    // Enquanto o Firebase ainda não respondeu, esconde tudo que é restrito
    // (evita "piscar" conteúdo restrito antes da checagem terminar)
    itensGestor.forEach(el => el.classList.add('escondido'));
    itensPatrocinador.forEach(el => el.classList.add('escondido'));
    if (botaoSairContainer) botaoSairContainer.style.display = 'none';

    // =====================================================
    //  OUVINTE DE AUTENTICAÇÃO — fonte real da verdade
    // =====================================================
    onAuthStateChanged(auth, async (user) => {
        let perfil = null;
        let nome = null;
        let foto = null;

        if (user) {
            try {
                const snap = await get(ref(db, `usuarios/${user.uid}`));
                if (snap.exists()) {
                    const dados = snap.val();
                    perfil = (dados.tipo || '').toLowerCase();
                    nome = dados.nome || null;
                    foto = dados.foto || null;

                    // Mantém um cache local só para leitura rápida por outras telas,
                    // mas quem decide acesso é sempre a checagem acima, feita a cada carregamento.
                    localStorage.setItem('sessaoGeTech', JSON.stringify({
                        loginAtivo: true,
                        perfil,
                        nome,
                        foto,
                        email: user.email
                    }));
                } else {
                    // Autenticado no Firebase, mas sem registro de permissão no banco
                    localStorage.removeItem('sessaoGeTech');
                }
            } catch (erro) {
                console.error("Erro ao buscar dados do usuário:", erro);
            }
        } else {
            localStorage.removeItem('sessaoGeTech');
        }

        aplicarInterface(perfil, nome, foto);
        verificarAcessoDaPagina(perfil);
    });

    // =====================================================
    //  APLICA VISIBILIDADE DE MENUS E AVATAR
    // =====================================================
    function aplicarInterface(perfil, nome, foto) {
        const estaLogado = !!perfil || perfil === '';
        const logado = perfil !== null;

        if (avatarImg) {
            avatarImg.src = logado
                ? (foto || "../assets/img/perfil.jpg")
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            avatarImg.style.display = 'inline-block';
        }

        if (!logado) {
            itensGestor.forEach(el => el.classList.add('escondido'));
            itensPatrocinador.forEach(el => el.classList.add('escondido'));
            if (botaoSairContainer) botaoSairContainer.style.display = 'none';
            return;
        }

        if (perfil === 'gestor') {
            itensGestor.forEach(el => el.classList.remove('escondido'));
            itensPatrocinador.forEach(el => el.classList.remove('escondido'));
        } else if (perfil === 'patrocinador') {
            itensGestor.forEach(el => el.classList.add('escondido'));
            itensPatrocinador.forEach(el => el.classList.remove('escondido'));
        } else {
            itensGestor.forEach(el => el.classList.add('escondido'));
            itensPatrocinador.forEach(el => el.classList.add('escondido'));
        }

        if (botaoSairContainer) botaoSairContainer.style.display = 'inline-block';
    }

    // =====================================================
    //  BLOQUEIO DE ACESSO DIRETO POR URL
    // =====================================================
    function verificarAcessoDaPagina(perfil) {
        if (window.location.pathname.includes("patrocinadores.html")) {
            if (perfil !== 'gestor' && perfil !== 'patrocinador') {
                alert("⚠️ Acesso restrito! Faça login como Patrocinador ou Gestor para continuar.");
                window.location.href = "login.html";
            }
        }

        if (window.location.pathname.includes("sistema.html") ||
            window.location.pathname.includes("orcamento.html") ||
            window.location.pathname.includes("mensagem.html")) {
            if (perfil !== 'gestor') {
                alert("⚠️ Acesso restrito! Apenas Gestores podem acessar esta área.");
                window.location.href = "login.html";
            }
        }
    }

    // =====================================================
    //  BOTÃO "SAIR" — desloga de verdade do Firebase
    // =====================================================
    if (botaoSairLink) {
        botaoSairLink.addEventListener("click", async function (event) {
            event.preventDefault();
            try {
                await signOut(auth);
            } catch (erro) {
                console.error("Erro ao sair:", erro);
            } finally {
                localStorage.removeItem("sessaoGeTech");
                localStorage.removeItem("usuarioLogado");
                alert("Sessão encerrada com sucesso!");
                window.location.href = "login.html";
            }
        });
    }
});