// ==========================================================================
// estoque.js — Gestão de Inventário
// ==========================================================================
import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get, push, update, runTransaction } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { registrarAuditoria } from "./auditoria.js";

const URL_LOGIN = "../../../Site C/pages/login.html";

let usuarioAtual = null;
let itemAtualId = null;      // id do registro no Firebase (faltava: sem ele não dá para atualizar)
let estoqueAtual = 0;
let nomeProdutoAtual = '';

function esc(v) {
    return String(v ?? '')
        .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function trocarTela(tela) {
    const cadastro = document.querySelector('#tela-cadastro');
    const estoque = document.querySelector('#tela-estoque');
    if (cadastro) cadastro.style.display = tela === 'cadastro' ? 'block' : 'none';
    if (estoque) estoque.style.display = tela === 'cadastro' ? 'none' : 'block';
}
window.trocarTela = trocarTela;

function atualizarVisor() {
    const produto = document.querySelector('#produtoSelecionado');
    const visor = document.querySelector('#visorQtd');   // o HTML usa #visorQtd, não #estoqueAtual
    if (produto) produto.textContent = nomeProdutoAtual ? 'Item: ' + nomeProdutoAtual : 'Nenhum item selecionado';
    if (visor) visor.textContent = estoqueAtual;
}

async function carregar() {
    const tabela = document.querySelector('#corpoTabela');
    if (!tabela) return;

    const snap = await get(ref(db, 'estoque'));
    const dados = snap.val() || {};

    tabela.innerHTML = '';
    Object.entries(dados).forEach(([id, v]) => {
        const linha = tabela.insertRow();
        linha.innerHTML = `<td>${esc(v.nome)}</td><td>${Number(v.quantidade) || 0}</td>
                           <td><button type="button">Gerenciar</button></td>`;
        linha.querySelector('button')
             .addEventListener('click', () => selecionarItem(id, String(v.nome ?? ''), Number(v.quantidade) || 0));
    });
}

function selecionarItem(id, nome, qtd) {
    itemAtualId = id;
    nomeProdutoAtual = nome;
    estoqueAtual = qtd;
    atualizarVisor();
    trocarTela('estoque');
}
window.carregarParaEstoque = selecionarItem;

// Entrada / Saída: os botões existiam no HTML mas não tinham nenhum handler.
async function movimentar(tipo) {
    if (!itemAtualId) return alert('Selecione um item na lista primeiro!');

    const campo = document.querySelector('#valorMovimentacao');
    const valor = Number(campo?.value);
    if (!Number.isFinite(valor) || valor <= 0) return alert('Informe uma quantidade válida!');

    const id = itemAtualId;
    const botoes = ['#btnEntrada', '#btnSaida'].map(seletor => document.querySelector(seletor));
    if (botoes.some(botao => botao?.disabled)) return;
    botoes.forEach(botao => { if (botao) botao.disabled = true; });
    const delta = tipo === 'entrada' ? valor : -valor;
    const itemRef = ref(db, `estoque/${id}`);
    try {
        await get(itemRef);
        const resultado = await runTransaction(itemRef, item => {
            if (!item || !Number.isFinite(item.quantidade) || item.quantidade + delta < 0) return;
            return {
                ...item,
                quantidade: item.quantidade + delta,
                atualizadoEm: new Date().toISOString(),
                atualizadoPor: usuarioAtual.uid
            };
        }, { applyLocally: false });
        if (!resultado.committed) {
            alert('Saldo insuficiente ou item indispon?vel.');
            return;
        }
        const item = resultado.snapshot.val();
        void registrarAuditoria(`Estoque: ${tipo}`, `${item.nome}: ${tipo} de ${valor} un. Saldo: ${item.quantidade}.`);
        if (id === itemAtualId) {
            estoqueAtual = item.quantidade;
            if (campo) campo.value = '';
            atualizarVisor();
        }
        await carregar();
    } catch (erro) {
        console.error(erro);
        alert('N?o foi poss?vel movimentar o estoque.');
    } finally {
        botoes.forEach(botao => { if (botao) botao.disabled = false; });
    }
}

document.querySelector('#btnEntrada')?.addEventListener('click', () => movimentar('entrada'));
document.querySelector('#btnSaida')?.addEventListener('click', () => movimentar('saida'));

document.querySelector('#btnRegistrar')?.addEventListener('click', async () => {
    const nomeEl = document.querySelector('#nomeItem');
    const qtdEl = document.querySelector('#qtdItem');
    if (!nomeEl || !qtdEl) return;

    const nome = nomeEl.value.trim();
    const qtd = Number(qtdEl.value);
    if (!nome || qtd <= 0) return alert('Preencha os dados corretamente!');
    if (!usuarioAtual) return alert('Sessão expirada. Faça login novamente.');

    if (!Number.isFinite(qtd)) return alert('Informe uma quantidade v?lida.');
    const botao = document.querySelector('#btnRegistrar');
    if (botao.disabled) return;
    botao.disabled = true;
    const id = push(ref(db, 'estoque')).key;
    try {
        await update(ref(db), {
            [`estoque/${id}`]: {
                nome,
                quantidade: qtd,
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString(),
                criadoPor: usuarioAtual.uid
            },
            [`catalogoPecas/${id}`]: nome
        });
        void registrarAuditoria('Estoque: novo item', `Item ${nome} cadastrado com quantidade ${qtd}.`);
        nomeEl.value = '';
        qtdEl.value = '';
        await carregar();
    } catch (erro) {
        console.error(erro);
        alert('N?o foi poss?vel cadastrar o item.');
    } finally {
        botao.disabled = false;
    }
});

onAuthStateChanged(auth, async user => {
    usuarioAtual = user;
    if (!user) { location.href = URL_LOGIN; return; }

    const snap = await get(ref(db, `usuarios/${user.uid}`));
    if (!snap.exists() || String(snap.val().tipo).toLowerCase() !== 'gestor') {
        alert('Acesso restrito.');
        location.href = URL_LOGIN;
        return;
    }
    carregar();
});
