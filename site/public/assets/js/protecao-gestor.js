// ===========================================================================
// protecao-gestor.js  (pasta public)
//
// Controle de acesso das páginas do site institucional (pasta public).
//
// REGRA:
//   - public: qualquer usuário LOGADO cujo perfil (usuarios/{uid}/tipo) esteja
//             em TIPOS_COM_ACESSO — gestor, cliente, patrocinador ou usuario.
//   - app:    somente gestor (essa trava fica nos scripts da pasta app).
//
// O nome do arquivo foi mantido para que as páginas que já o carregam
// continuem funcionando sem nenhuma alteração no HTML.
//
// "usuario" é o perfil criado pelo cadastro da página login.html (public).
// Sem ele, quem se cadastra por ali ficaria logado, porém trancado para fora.
//
// NÃO incluir este script em public/pages/login.html: ela é a única porta de
// entrada para autenticação do site institucional. Bloqueá-la aqui deixaria
// qualquer pessoa sem como fazer login.
// ===========================================================================

import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const BASE_URL = window.location.origin + "/GeTech";
const DESTINO_LOGIN = `${BASE_URL}/site/public/pages/login.html`;
const DESTINO_SITE_C = `${BASE_URL}/site/Site C/pages/index.html`;

// Tipos de perfil que podem abrir as páginas da pasta public.
const TIPOS_COM_ACESSO = ["gestor", "cliente", "patrocinador", "usuario"];

function bloquearAcesso(mensagem, destino) {
    alert(mensagem);
    window.location.href = destino;
}

onAuthStateChanged(auth, async (user) => {
    // Clique em "Sair": o logout() do verificacaologin.js já cuida do
    // redirecionamento. Sem isso, o alerta aparece e os dois redirecionam.
    if (window.__getechSaindo) return;

    if (!user) {
        bloquearAcesso("Faça login para acessar esta página.", DESTINO_LOGIN);
        return;
    }

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const perfil = snap.exists() ? snap.val() : {};
        const tipo = String(perfil.tipo || "").toLowerCase();

        if (!TIPOS_COM_ACESSO.includes(tipo)) {
            bloquearAcesso("Seu perfil não tem acesso a esta página.", DESTINO_SITE_C);
        }
    } catch (erro) {
        console.error("[Proteção Public] Erro ao verificar o perfil do usuário:", erro);
        bloquearAcesso("Não foi possível verificar seu perfil de acesso. Tente novamente.", DESTINO_SITE_C);
    }
});