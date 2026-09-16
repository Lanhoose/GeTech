import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import { ref, get, push, set } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

let perfilCache = null;

async function obterPerfilAtual() {
    const user = auth.currentUser;
    if (!user) return null;
    if (perfilCache?.uid === user.uid) return perfilCache;
    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const dados = snap.exists() ? snap.val() : {};
        perfilCache = { uid: user.uid, nome: dados.nome || user.displayName || user.email || 'Usuário', email: dados.email || user.email || '', tipo: dados.tipo || '' };
        return perfilCache;
    } catch {
        perfilCache = { uid: user.uid, nome: user.displayName || user.email || 'Usuário', email: user.email || '', tipo: '' };
        return perfilCache;
    }
}

export async function registrarAuditoria(acao, detalhe = '', criticidade = 'info') {
    const perfil = await obterPerfilAtual();
    if (!perfil) return false;
    try {
        const novaRef = push(ref(db, 'auditoria'));
        await set(novaRef, {
            id: novaRef.key,
            dataHora: new Date().toISOString(),
            usuario: perfil.nome || perfil.email || 'Usuário',
            usuarioUid: perfil.uid,
            usuarioEmail: perfil.email,
            acao: String(acao),
            detalhe: String(detalhe || ''),
            criticidade: criticidade || 'info'
        });
        return true;
    } catch (erro) {
        console.error('[Auditoria] Não foi possível registrar:', erro);
        return false;
    }
}

export function limparCacheAuditoria() { perfilCache = null; }
