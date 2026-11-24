import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { ref, get, onValue, update } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';
import { registrarAuditoria } from './auditoria.js';

const status = document.getElementById('statusModeracao');
const fila = document.getElementById('filaModeracao');
const secoes = {
    postsBlog: { lista: 'postsBlog', rotulo: 'Publicação' },
    postsBlogOcultos: { lista: 'ocultos', rotulo: 'Publicação oculta' },
    depoimentos: { lista: 'depoimentos', rotulo: 'Depoimento publicado' },
    depoimentosPendentes: { lista: 'depoimentos', rotulo: 'Depoimento pendente' },
    depoimentosOcultos: { lista: 'ocultos', rotulo: 'Depoimento oculto' }
};
const dados = new Map();
const assinaturas = [];
const emAndamento = new Set();

async function mover(origem, destino, id, acao) {
    const chave = `${origem}/${id}`;
    if (emAndamento.has(chave)) return;
    if ((['postsBlogOcultos', 'depoimentosOcultos'].includes(origem) || acao === 'Ocultamento') && !confirm('Confirmar esta mudança de visibilidade?')) return;
    emAndamento.add(chave);
    renderizar();
    try {
        const snap = await get(ref(db, chave));
        if (!snap.exists()) throw new Error('O conteúdo já foi moderado. Confira a fila.');
        await update(ref(db), { [chave]: null, [`${destino}/${id}`]: snap.val() });
        status.textContent = `${acao} concluído.`;
        void registrarAuditoria('Moderação: conteúdo movido', `${origem}/${id} → ${destino}`);
    } catch (erro) {
        console.error(erro);
        status.textContent = 'Não foi possível atualizar o conteúdo. Confira a fila e tente novamente.';
    } finally {
        emAndamento.delete(chave);
        renderizar();
    }
}

function criarCartao(origem, id, conteudo) {
    const card = document.createElement('article');
    card.className = 'maq-card';
    const titulo = document.createElement('h3');
    titulo.textContent = conteudo.title || conteudo.nome;
    const tipo = document.createElement('small');
    tipo.textContent = secoes[origem].rotulo;
    const texto = document.createElement('p');
    texto.textContent = conteudo.desc || conteudo.texto;
    const meta = document.createElement('p');
    const data = new Date(conteudo.criadoEm || NaN);
    meta.textContent = [conteudo.authorName || conteudo.nome || 'Autor não informado',
        Number.isFinite(data.getTime()) ? data.toLocaleString('pt-BR') : conteudo.date || 'Data não informada'].join(' · ');
    const pendente = origem === 'depoimentosPendentes';
    card.classList.toggle('pendente-moderacao', pendente);
    card.append(tipo, titulo, meta, texto);
    const acoes = {
        postsBlog: [['Ocultar', 'postsBlogOcultos', 'Ocultamento']],
        postsBlogOcultos: [['Restaurar', 'postsBlog', 'Restauro']],
        depoimentos: [['Ocultar', 'depoimentosOcultos', 'Ocultamento']],
        depoimentosPendentes: [['Aprovar', 'depoimentos', 'Envio para publicação'], ['Ocultar', 'depoimentosOcultos', 'Ocultamento']],
        depoimentosOcultos: [['Publicar', 'depoimentos', 'Envio para publicação']]
    };
    for (const [rotulo, destino, acao] of acoes[origem]) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'btn-app btn-outline-app';
        botao.textContent = rotulo;
        botao.disabled = emAndamento.has(`${origem}/${id}`);
        botao.onclick = () => mover(origem, destino, id, acao);
        card.append(botao);
    }
    return card;
}

function renderizar() {
    for (const listaId of ['postsBlog', 'depoimentos', 'ocultos']) {
        const lista = document.getElementById(listaId);
        lista.replaceChildren();
        const itens = Object.entries(secoes).filter(([, secao]) => secao.lista === listaId)
            .flatMap(([origem]) => Object.entries(dados.get(origem) || {}).map(([id, conteudo]) => ({ origem, id, conteudo })))
            .sort((a, b) => {
                const pendente = item => Number(item.origem === 'depoimentosPendentes');
                return pendente(b) - pendente(a) || (b.conteudo.criadoEm || 0) - (a.conteudo.criadoEm || 0);
            });
        for (const { origem, id, conteudo } of itens) lista.append(criarCartao(origem, id, conteudo));
        if (listaId === 'depoimentos') {
            const total = itens.filter(item => item.origem === 'depoimentosPendentes').length;
            document.getElementById('contadorPendentes').textContent = `${total} aguardando aprovação`;
        }
        if (!itens.length) lista.textContent = 'Nenhum conteúdo nesta lista.';
    }
}

onAuthStateChanged(auth, async user => {
    assinaturas.splice(0).forEach(parar => parar());
    dados.clear();
    fila.hidden = true;
    if (!user) {
        location.replace('../../../public/pages/login.html');
        return;
    }
    try {
        const perfil = (await get(ref(db, `usuarios/${user.uid}`))).val();
        if (auth.currentUser?.uid !== user.uid) return;
        if (perfil?.tipo !== 'gestor') {
            status.textContent = 'Apenas gestores podem acessar a moderação.';
            return;
        }
        fila.hidden = false;
        for (const origem of Object.keys(secoes)) {
            assinaturas.push(onValue(ref(db, origem), snap => {
                dados.set(origem, snap.val());
                renderizar();
            }, erro => {
                console.error(erro);
                dados.delete(origem);
                renderizar();
                status.textContent = 'Não foi possível carregar todos os conteúdos.';
            }));
        }
    } catch (erro) {
        console.error(erro);
        status.textContent = 'Não foi possível validar seu acesso.';
    }
});
