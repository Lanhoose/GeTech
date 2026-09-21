// ==========================================================================
// estoque.js — Gestão de Inventário
// ==========================================================================
import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get, push, set, update } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
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
    if (!valor || valor <= 0) return alert('Informe uma quantidade válida!');

    const novaQtd = tipo === 'entrada' ? estoqueAtual + valor : estoqueAtual - valor;
    if (novaQtd < 0) return alert('Estoque insuficiente para essa saída!');

    await update(ref(db, `estoque/${itemAtualId}`), {
        quantidade: novaQtd,
        atualizadoEm: new Date().toISOString(),
        atualizadoPor: usuarioAtual?.uid || null
    });

    await registrarAuditoria(
        `Estoque: ${tipo}`,
        `${nomeProdutoAtual}: ${tipo} de ${valor} un. (${estoqueAtual} → ${novaQtd}).`,
        'info'
    );

    estoqueAtual = novaQtd;
    if (campo) campo.value = '';
    atualizarVisor();
    await carregar();
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

    const r = push(ref(db, 'estoque'));
    await set(r, {
        nome,
        quantidade: qtd,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        criadoPor: usuarioAtual.uid
    });

    await registrarAuditoria('Estoque: novo item', `Item ${nome} cadastrado com quantidade ${qtd}.`, 'info');
    nomeEl.value = '';
    qtdEl.value = '';
    await carregar();
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
