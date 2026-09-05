// ==========================================================================
// CAIXA DE MENSAGENS - FIREBASE
// ===========================================================================

import { auth, db } from "./firebase-config.js";
import {
    ref,
    onValue,
    remove,
    set
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { registrarAuditoria } from "../../app/assets/js/auditoria.js";

const containerMensagens = document.getElementById("containerMensagens");
const btnLimparTudo = document.getElementById("btnLimparTudo");
const chamadosRef = ref(db, "chamadosChatbot");

let chamadosCache = [];
let usuarioAutenticado = null;

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatarData(data) {
    if (!data) return "Data não registrada";

    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return data;

    return d.toLocaleString("pt-BR");
}

function carregarMensagens() {
    if (!containerMensagens || !btnLimparTudo) return;

    const chamados = [...chamadosCache].sort(
        (a, b) => new Date(b.data || 0) - new Date(a.data || 0)
    );

    if (!chamados.length) {
        btnLimparTudo.style.display = "none";
        containerMensagens.innerHTML = `
            <div class="sem-mensagens">
                <h3>Sua caixa está limpa!</h3>
                <p>Nenhuma mensagem ou ordem de serviço foi enviada pelo assistente virtual até o momento.</p>
            </div>
        `;
        return;
    }

    btnLimparTudo.style.display = "block";
    containerMensagens.innerHTML = "";

    chamados.forEach((chamado, index) => {
        const card = document.createElement("div");
        card.classList.add("card-mensagem");

        card.innerHTML = `
            <div class="card-header-msg">
                <span><strong>ID Chamado:</strong> #${index + 1}</span>
                <span>${escaparHTML(formatarData(chamado.data))}</span>
            </div>
            <div class="card-body-msg">
                <p><span class="label">Cliente:</span> ${escaparHTML(chamado.nome)}</p>
                <p><span class="label">E-mail de Contato:</span> <a href="mailto:${escaparHTML(chamado.email)}">${escaparHTML(chamado.email)}</a></p>
                <p><span class="label">Status:</span> ${escaparHTML(chamado.status || "Novo")}</p>
                <p class="problema-texto"><span class="label">Descrição do Problema:</span><br>${escaparHTML(chamado.problema)}</p>
            </div>
            <div style="text-align:right;margin-top:15px;">
                <button class="btn-deletar-unica" data-id="${escaparHTML(chamado.id)}">Excluir Registro</button>
            </div>
        `;

        card.querySelector("button")?.addEventListener("click", () => {
            deletarMensagem(chamado.id);
        });

        containerMensagens.appendChild(card);
    });
}

async function deletarMensagem(id) {
    if (!id) return;

    if (!confirm("Tem certeza que deseja apagar este registro de atendimento?")) {
        return;
    }

    try {
        await remove(ref(db, `chamadosChatbot/${id}`));
        await registrarAuditoria('Mensagens: chamado excluído', `Chamado ${id} excluído da caixa de mensagens.`, 'warning');
    } catch (erro) {
        console.error("Erro ao excluir chamado:", erro);
        alert("Não foi possível excluir o registro.");
    }
}

async function limparTodasMensagens() {
    if (!confirm("ATENÇÃO: Você tem certeza que deseja apagar TODAS as mensagens recebidas? Esta ação não pode ser desfeita.")) {
        return;
    }

    try {
        await set(chamadosRef, null);
        await registrarAuditoria('Mensagens: caixa limpa', 'Todos os chamados da caixa de mensagens foram excluídos.', 'warning');
    } catch (erro) {
        console.error("Erro ao limpar chamados:", erro);
        alert("Não foi possível limpar a caixa de mensagens.");
    }
}

onAuthStateChanged(auth, (user) => {
    usuarioAutenticado = user || null;

    if (!user) {
        if (containerMensagens) {
            containerMensagens.innerHTML = `
                <div class="sem-mensagens">
                    <h3>Acesso necessário</h3>
                    <p>Faça login para visualizar os chamados.</p>
                </div>
            `;
        }
        return;
    }

    onValue(chamadosRef, (snapshot) => {
        const dados = snapshot.val() || {};
        chamadosCache = Object.entries(dados).map(([id, chamado]) => ({
            id,
            ...chamado
        }));

        carregarMensagens();
    });
});

window.deletarMensagem = deletarMensagem;
window.limparTodasMensagens = limparTodasMensagens;
