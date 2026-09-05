// ==========================================================================
// CHATBOT - CHAMADOS NO FIREBASE
// ===========================================================================

import { auth, db } from "./firebase-config.js";
import { registrarAuditoria } from "../../app/assets/js/auditoria.js";
import {
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

let passoAtual = 0;
let usuarioFirebase = null;
const dadosColetados = { nome: "", email: "", problema: "" };

const perguntas = [
    "Olá! Sou o assistente da GeTech. Para começarmos, qual é o seu **nome**?",
    "Prazer, {nome}! Qual o seu **e-mail** para contato?",
    "Ótimo! Agora, por favor, descreva brevemente o **problema da sua máquina**:",
    "Perfeito, {nome}! Recebemos as informações com sucesso. Nossa equipe técnica analisará o problema e entrará em contato via e-mail ({email}) muito em breve! 🛠️"
];

function adicionarMensagem(texto, remetente) {
    if (!chatMessages) return;

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", remetente);
    msgDiv.innerHTML = String(texto).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function iniciarChat() {
    if (chatMessages && !chatMessages.children.length) {
        adicionarMensagem(perguntas[0], "bot");
    }
}

async function salvarMensagemNoSistema() {
    const chamadoRef = push(ref(db, "chamadosChatbot"));

    const chamado = {
        nome: dadosColetados.nome,
        email: dadosColetados.email,
        problema: dadosColetados.problema,
        data: new Date().toISOString(),
        status: "Novo",
        usuarioUid: usuarioFirebase?.uid || null
    };

    await set(chamadoRef, chamado);
    await registrarAuditoria('Chatbot: chamado aberto', `Chamado aberto por ${dadosColetados.nome || dadosColetados.email || 'usuário'}.`, 'info');

    console.log("Chamado salvo no Firebase:", chamadoRef.key);
}

async function enviarResposta(respostaUser) {
    adicionarMensagem(respostaUser, "user");
    userInput.value = "";

    if (passoAtual === 0) {
        dadosColetados.nome = respostaUser;
        passoAtual++;

        const pergunta = perguntas[1].replace("{nome}", dadosColetados.nome);
        setTimeout(() => adicionarMensagem(pergunta, "bot"), 600);
        return;
    }

    if (passoAtual === 1) {
        dadosColetados.email = respostaUser;
        passoAtual++;

        setTimeout(() => adicionarMensagem(perguntas[2], "bot"), 600);
        return;
    }

    if (passoAtual === 2) {
        dadosColetados.problema = respostaUser;
        passoAtual++;

        const mensagemFinal = perguntas[3]
            .replace("{nome}", dadosColetados.nome)
            .replace("{email}", dadosColetados.email);

        setTimeout(async () => {
            adicionarMensagem(mensagemFinal, "bot");

            if (userInput) {
                userInput.disabled = true;
                userInput.placeholder = "Atendimento concluído.";
            }

            const botao = chatForm?.querySelector("button");
            if (botao) botao.disabled = true;

            try {
                await salvarMensagemNoSistema();
            } catch (erro) {
                console.error("Erro ao salvar chamado no Firebase:", erro);
                alert("O atendimento foi concluído, mas não foi possível registrar o chamado. Tente novamente mais tarde.");
            }
        }, 600);
    }
}

if (chatForm) {
    chatForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const resposta = userInput?.value.trim();
        if (!resposta) return;

        await enviarResposta(resposta);
    });
}

onAuthStateChanged(auth, (user) => {
    usuarioFirebase = user || null;

    const avatar = document.getElementById("avatarUsuario");
    if (avatar) {
        avatar.style.display = user ? "inline-block" : "none";
    }
});

document.addEventListener("DOMContentLoaded", iniciarChat);

window.scrollToChat = function () {
    document.getElementById("atendimento")?.scrollIntoView({ behavior: "smooth" });
};
