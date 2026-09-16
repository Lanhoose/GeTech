// ==========================================================================
// CHATBOT - CHAMADOS NO FIREBASE
//
// Antes de iniciar a conversa o bot verifica a sessão do Firebase:
//  - visitante deslogado  -> o chat pergunta nome e e-mail;
//  - usuário autenticado  -> o e-mail (e o nome, quando existe em
//    usuarios/{uid}) vêm da própria sessão e essas perguntas são puladas.
// ===========================================================================

import { auth, db } from "./firebase-config.js";
import { registrarAuditoria } from "../../../app/assets/js/auditoria.js";
import {
    ref,
    push,
    set,
    get
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

let usuarioFirebase = null;
let chatIniciado = false;

// Passos ainda pendentes. A lista é montada depois da verificação de login.
let passosPendentes = [];

const dadosColetados = { nome: "", email: "", problema: "" };

const PERGUNTAS = {
    nome: "Olá! Sou o assistente da GeTech. Para começarmos, qual é o seu **nome**?",
    email: "Prazer, {nome}! Qual o seu **e-mail** para contato?",
    problema: "Agora, por favor, descreva brevemente o **problema da sua máquina**:"
};

// Usuário logado já foi cumprimentado na saudação inicial — o pedido do nome
// (quando o perfil não tem um) precisa de outra redação.
const PERGUNTA_NOME_LOGADO = "Como podemos te chamar?";

let perguntas = { ...PERGUNTAS };

const MENSAGEM_FINAL =
    "Perfeito, {nome}! Recebemos as informações com sucesso. Nossa equipe técnica " +
    "analisará o problema e entrará em contato via e-mail ({email}) muito em breve! 🛠️";

function adicionarMensagem(texto, remetente) {
    if (!chatMessages) return;

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", remetente);
    msgDiv.innerHTML = String(texto).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function preencher(texto) {
    return String(texto)
        .replace("{nome}", dadosColetados.nome || "tudo bem")
        .replace("{email}", dadosColetados.email);
}

function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim());
}

function bloquearEntrada(mensagem) {
    if (userInput) {
        userInput.disabled = true;
        userInput.placeholder = mensagem;
    }
    const botao = chatForm?.querySelector("button");
    if (botao) botao.disabled = true;
}

// ==========================================================================
// VERIFICAÇÃO DE LOGIN
// Resolve assim que o Firebase informa o primeiro estado da sessão.
// ==========================================================================
function aguardarEstadoDeLogin() {
    return new Promise((resolve) => {
        const encerrar = onAuthStateChanged(auth, (user) => {
            encerrar();
            resolve(user || null);
        }, () => {
            encerrar();
            resolve(null);
        });
    });
}

async function obterNomeDoPerfil(user) {
    if (!user) return "";

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const dados = snap.exists() ? snap.val() : {};
        return dados.nome || user.displayName || "";
    } catch (erro) {
        console.error("[Chatbot] Não foi possível ler o perfil do usuário:", erro);
        return user.displayName || "";
    }
}

async function prepararConversa() {
    if (chatIniciado) return;
    chatIniciado = true;

    const user = await aguardarEstadoDeLogin();
    usuarioFirebase = user;

    const avatar = document.getElementById("avatarUsuario");
    if (avatar) avatar.style.display = user ? "inline-block" : "none";

    if (user?.email) {
        // Usuário logado: aproveita os dados da sessão.
        dadosColetados.email = user.email;
        dadosColetados.nome = await obterNomeDoPerfil(user);

        const saudacao = dadosColetados.nome
            ? `Olá, **${dadosColetados.nome}**! Você está conectado com o e-mail **${dadosColetados.email}**.`
            : `Olá! Você está conectado com o e-mail **${dadosColetados.email}**.`;

        adicionarMensagem(saudacao, "bot");

        // Só pergunta o nome se ele não estiver cadastrado no perfil.
        perguntas = { ...PERGUNTAS, nome: PERGUNTA_NOME_LOGADO };
        passosPendentes = dadosColetados.nome ? ["problema"] : ["nome", "problema"];
    } else {
        // Visitante anônimo: fluxo completo.
        passosPendentes = ["nome", "email", "problema"];
    }

    const proximo = passosPendentes[0];
    setTimeout(() => adicionarMensagem(preencher(perguntas[proximo]), "bot"), user ? 600 : 0);
}

// ==========================================================================
// PERSISTÊNCIA
// ==========================================================================
async function salvarMensagemNoSistema() {
    const chamadoRef = push(ref(db, "chamadosChatbot"));

    const chamado = {
        nome: dadosColetados.nome,
        email: dadosColetados.email,
        problema: dadosColetados.problema,
        data: new Date().toISOString(),
        status: "Novo",
        usuarioUid: usuarioFirebase?.uid || null,
        origemEmail: usuarioFirebase ? "sessao" : "informado"
    };

    await set(chamadoRef, chamado);
    await registrarAuditoria(
        'Chatbot: chamado aberto',
        `Chamado aberto por ${dadosColetados.nome || dadosColetados.email || 'usuário'}.`,
        'info'
    );

    console.log("Chamado salvo no Firebase:", chamadoRef.key);
}

async function finalizarAtendimento() {
    adicionarMensagem(preencher(MENSAGEM_FINAL), "bot");
    bloquearEntrada("Atendimento concluído.");

    try {
        await salvarMensagemNoSistema();
    } catch (erro) {
        console.error("Erro ao salvar chamado no Firebase:", erro);
        alert("O atendimento foi concluído, mas não foi possível registrar o chamado. Tente novamente mais tarde.");
    }
}

async function enviarResposta(respostaUser) {
    const passo = passosPendentes[0];
    if (!passo) return;

    adicionarMensagem(respostaUser, "user");
    if (userInput) userInput.value = "";

    // O e-mail digitado por visitante passa por uma validação simples.
    if (passo === "email" && !emailValido(respostaUser)) {
        setTimeout(() => adicionarMensagem("Esse e-mail não parece válido. Pode digitar novamente?", "bot"), 600);
        return;
    }

    dadosColetados[passo] = respostaUser.trim();
    passosPendentes.shift();

    const proximo = passosPendentes[0];

    if (proximo) {
        setTimeout(() => adicionarMensagem(preencher(perguntas[proximo]), "bot"), 600);
        return;
    }

    setTimeout(finalizarAtendimento, 600);
}

if (chatForm) {
    chatForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const resposta = userInput?.value.trim();
        if (!resposta) return;

        await enviarResposta(resposta);
    });
}

// Mantém o avatar sincronizado caso o usuário entre ou saia com o chat aberto.
onAuthStateChanged(auth, (user) => {
    const avatar = document.getElementById("avatarUsuario");
    if (avatar) avatar.style.display = user ? "inline-block" : "none";
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", prepararConversa);
} else {
    prepararConversa();
}

window.scrollToChat = function () {
    document.getElementById("atendimento")?.scrollIntoView({ behavior: "smooth" });
};