// ===========================================================================
// protecao-gestor.js
//
// Verificação de acesso restrito a gestor para as páginas do site
// institucional (pasta public). Segue o mesmo padrão de integracao.js e
// configuracoes.js: usuário sem sessão, ou com usuarios/{uid}/tipo diferente
// de "gestor", é avisado e enviado para a home do Site C.
//
// NÃO incluir este script em public/pages/login.html: ela é a única porta de
// entrada para autenticação do site institucional. Bloqueá-la aqui deixaria
// qualquer pessoa — inclusive um gestor com a sessão expirada — sem como
// voltar a fazer login.
// ===========================================================================

import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const BASE_URL = window.location.origin + "/GeTech";
const DESTINO_SITE_C = `${BASE_URL}/site/Site C/pages/index.html`;

function bloquearAcesso(mensagem) {
    alert(mensagem);
    window.location.href = DESTINO_SITE_C;
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        bloquearAcesso("Acesso restrito. Apenas gestores podem acessar esta página.");
        return;
    }

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const perfil = snap.exists() ? snap.val() : {};

        if ((perfil.tipo || "").toLowerCase() !== "gestor") {
            bloquearAcesso("Acesso restrito. Apenas gestores podem acessar esta página.");
        }
    } catch (erro) {
        console.error("[Proteção Gestor] Erro ao verificar o perfil do usuário:", erro);
        bloquearAcesso("Não foi possível verificar seu perfil de acesso. Tente novamente.");
    }
});
