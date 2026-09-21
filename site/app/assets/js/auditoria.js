// ===========================================================================
// auditoria.js - GeTech
// Sistema de auditoria
//
// IMPORTANTE:
// - Gestores podem registrar auditorias.
// - Usuários comuns não escrevem em "auditoria".
// - Permission denied não aparece como erro vermelho no console.
// - Uma falha de auditoria nunca deve quebrar a operação principal.
// ===========================================================================

import {
    auth,
    db
} from "../../../Site C/assets/js/firebase-config.js";

import {
    ref,
    get,
    push,
    set
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


// ===========================================================================
// VERIFICAR SE O USUÁRIO É GESTOR
// ===========================================================================

async function usuarioEhGestor(user) {

    if (!user) {

        return false;

    }


    try {

        const snapshot =
            await get(
                ref(
                    db,
                    `usuarios/${user.uid}`
                )
            );


        if (!snapshot.exists()) {

            return false;

        }


        const dados =
            snapshot.val() || {};


        const tipo =
            String(
                dados.tipo || ""
            ).toLowerCase();


        return (
            tipo === "gestor"
        );


    } catch (erro) {

        // Não exibe Permission denied como erro vermelho.
        console.warn(
            "[Auditoria] Não foi possível verificar o perfil do usuário."
        );


        return false;

    }

}


// ===========================================================================
// REGISTRAR AUDITORIA
// ===========================================================================

export async function registrarAuditoria(
    acao,
    descricao = "",
    nivel = "info"
) {

    // =======================================================================
    // VERIFICAR USUÁRIO
    // =======================================================================

    const user =
        auth.currentUser;


    if (!user) {

        // Usuário não autenticado.
        // Não tenta escrever no Firebase.

        return false;

    }


    // =======================================================================
    // VERIFICAR PERMISSÃO
    // =======================================================================

    const ehGestor =
        await usuarioEhGestor(
            user
        );


    if (!ehGestor) {

        // ===============================================================
        // USUÁRIO COMUM
        //
        // Não tenta escrever em "auditoria".
        //
        // Isso evita o:
        //
        // Error: Permission denied
        //
        // ===============================================================

        return false;

    }


    // =======================================================================
    // REFERÊNCIA DO NOVO LOG
    // =======================================================================

    try {

        const auditoriaRef =
            push(
                ref(
                    db,
                    "auditoria"
                )
            );


        // ===================================================================
        // DADOS
        // ===================================================================

        const dadosAuditoria = {

            id:
                auditoriaRef.key,

            acao:
                String(
                    acao || "Evento"
                ),

            descricao:
                String(
                    descricao || ""
                ),

            nivel:
                String(
                    nivel || "info"
                ),

            usuario:
                user.email ||
                "",

            usuarioUid:
                user.uid,

            data:
                new Date().toISOString(),

            dataHora:
                Date.now()

        };


        // ===================================================================
        // SALVAR
        // ===================================================================

        await set(

            auditoriaRef,

            dadosAuditoria

        );


        return true;


    } catch (erro) {

        // ===================================================================
        // FALHA NA AUDITORIA
        // ===================================================================
        //
        // A auditoria é secundária.
        // Ela nunca deve impedir:
        //
        // - solicitação Enterprise
        // - alteração de preço
        // - exclusão
        // - outras operações do sistema
        //
        // ===================================================================

        if (
            erro?.code ===
            "PERMISSION_DENIED" ||
            erro?.message?.includes(
                "Permission denied"
            )
        ) {

            console.warn(
                "[Auditoria] Operação realizada, mas o registro de auditoria não foi permitido pelas Rules."
            );

            return false;

        }


        console.warn(
            "[Auditoria] Não foi possível registrar o evento:",
            erro
        );


        return false;

    }

}


// ===========================================================================
// FUNÇÃO COMPATÍVEL COM CÓDIGOS ANTIGOS
// ===========================================================================

window.registrarAuditoria =
    registrarAuditoria;