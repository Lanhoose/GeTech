// ===========================================================================
// protecao-gestor.js
//
// Mesmo padrão de verificação usado em estoque.js, rh.js, manutencao.js e
// orderns.js — mas para páginas do app/ que não têm um arquivo .js próprio
// (Visão Geral e Sistema). Sem sessão, ou com usuarios/{uid}/tipo diferente
// de "gestor", a pessoa é avisada e mandada para o login.
// ===========================================================================

import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
const BASE_URL = window.location.origin + "/GeTech";
const DESTINO_LOGIN = `${BASE_URL}/site/public/pages/login.html`;
const DESTINO_VOLTAR = `${BASE_URL}/site/Site C/pages/index.html`;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = DESTINO_LOGIN;
        return;
    }

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const perfil = snap.exists() ? snap.val() : {};

        if (String(perfil.tipo || '').toLowerCase() !== 'gestor') {
            alert('Acesso restrito.');
            window.location.href = DESTINO_VOLTAR;
        }
    } catch (erro) {
        console.error('[Proteção Gestor] Erro ao verificar o perfil do usuário:', erro);
        alert('Não foi possível verificar seu perfil de acesso.');
        window.location.href = DESTINO_VOLTAR;
    }
});