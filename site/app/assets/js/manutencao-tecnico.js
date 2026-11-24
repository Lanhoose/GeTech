import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { ref, get, runTransaction, onValue, query, orderByChild, equalTo, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';
import { editorPecas, resumoPecas } from './pecas-os.js';
import { anexarFoto, abrirFicha, idFicha, urlFicha } from './ficha-maquina.js';

const status = document.getElementById('statusTecnico');
const lista = document.getElementById('ordensTecnico');
const cartoes = new Map();
const assinaturas = [];
const login = new URL('../../../public/pages/login.html', location.href);
if (idFicha) login.searchParams.set('maquina', idFicha);
let catalogo = {};
let versaoFicha = 0;

async function prepararFoto(arquivo) {
    if (!arquivo?.size) return null;
    if (!arquivo.type.startsWith('image/') || arquivo.size > 15 * 1024 * 1024) {
        throw new Error('Escolha uma imagem de até 15 MB.');
    }
    const imagem = await createImageBitmap(arquivo);
    try {
        const escala = Math.min(1, 640 / Math.max(imagem.width, imagem.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(imagem.width * escala));
        canvas.height = Math.max(1, Math.round(imagem.height * escala));
        const contexto = canvas.getContext('2d');
        contexto.fillStyle = '#fff';
        contexto.fillRect(0, 0, canvas.width, canvas.height);
        contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
        const foto = canvas.toDataURL('image/jpeg', 0.65);
        if (foto.length > 250000 || !foto.startsWith('data:image/jpeg;base64,')) {
            throw new Error('A imagem é muito detalhada. Tente uma foto menor.');
        }
        return foto;
    } finally {
        imagem.close();
    }
}

function criarCartao(id, ordem, user) {
    const card = document.createElement('article');
    card.className = 'maq-card';
    const titulo = document.createElement('h3');
    titulo.textContent = ordem.maquina;
    const descricao = document.createElement('p');
    descricao.textContent = ordem.descricao;
    const situacao = document.createElement('p');
    situacao.textContent = ordem.execucao && ordem.status !== 'concluido' ? 'Aguardando revisão' : ordem.status;
    card.append(titulo, descricao, situacao);
    if (ordem.motivoDevolucao && !ordem.execucao && ordem.status !== 'concluido') {
        const motivo = document.createElement('p');
        motivo.textContent = 'Motivo da devolução: ' + ordem.motivoDevolucao;
        card.append(motivo);
    }
    if (ordem.maquinaId) {
        const link = document.createElement('a');
        link.href = urlFicha(ordem.maquinaId);
        link.textContent = 'Abrir ficha da máquina';
        card.append(link);
    }

    if (ordem.execucao || ordem.status === 'concluido') {
        const resumo = document.createElement('p');
        resumo.textContent = [ordem.execucao?.relato, resumoPecas(ordem.pecas || ordem.execucao?.pecas)].filter(Boolean).join(' · ');
        card.append(resumo);
        anexarFoto(card, ordem.execucao?.foto);
        return { card };
    }

    const form = document.getElementById('formExecucao').content.firstElementChild.cloneNode(true);
    const editor = editorPecas(form);
    editor.atualizarCatalogo(catalogo);
    editor.preencher(ordem.pecas);
    card.append(form);
    let sequenciaFoto = 0;
    form.elements.foto.onchange = async () => {
        const atual = ++sequenciaFoto;
        const previa = form.querySelector('[data-previa-foto]');
        previa.replaceChildren();
        const mensagem = form.querySelector('[role="status"]');
        mensagem.textContent = '';
        try {
            const foto = await prepararFoto(form.elements.foto.files[0]);
            if (atual === sequenciaFoto) anexarFoto(previa, foto);
        } catch (erro) {
            if (atual === sequenciaFoto) mensagem.textContent = erro.message;
        }
    };
    form.onsubmit = async (evento) => {
        evento.preventDefault();
        const botao = form.querySelector('[type="submit"]');
        const mensagem = form.querySelector('[role="status"]');
        if (botao.disabled) return;
        botao.disabled = true;
        mensagem.textContent = '';
        try {
            const relato = form.elements.relato.value.trim();
            if (!relato) throw new Error('Descreva o serviço realizado.');
            const pecas = editor.ler();
            const foto = await prepararFoto(form.elements.foto.files[0]);
            const resultado = await runTransaction(ref(db, `ordensServico/${id}/execucao`), atual => {
                if (atual) return;
                return { relato, pecas, foto, uid: user.uid, enviadoEm: serverTimestamp(), versaoOS: ordem.versao || 0 };
            }, { applyLocally: false });
            if (!resultado.committed) throw new Error('Esta ordem já foi enviada para revisão.');
        } catch (erro) {
            console.error(erro);
            mensagem.textContent = erro.code === 'PERMISSION_DENIED'
                ? 'A ordem mudou ou já foi enviada. Confira a lista antes de tentar novamente.'
                : erro.message;
        } finally {
            botao.disabled = false;
        }
    };
    return { card, editor };
}

async function mostrarFicha(ordens, versao) {
    if (!idFicha) return;
    if (!/^[\w-]+$/.test(idFicha)) {
        status.textContent = 'O link da máquina é inválido.';
        return;
    }
    try {
        const maquina = (await get(ref(db, `maquinas/${idFicha}`))).val();
        if (versao !== versaoFicha) return;
        if (!maquina) {
            status.textContent = 'Máquina não encontrada.';
            return;
        }
        abrirFicha({
            ...maquina, id: idFicha,
            nome: maquina.nome || maquina.nomeMaquina,
            modelo: maquina.modelo || maquina.modeloMaquina,
            serie: maquina.serie || maquina.numeroDeSerie
        }, ordens.filter(os => os.maquinaId === idFicha));
    } catch (erro) {
        console.error(erro);
        if (versao === versaoFicha) status.textContent = 'Não foi possível carregar a ficha.';
    }
}

document.getElementById('sair').onclick = async () => {
    try {
        await signOut(auth);
    } catch (erro) {
        console.error(erro);
        status.textContent = 'Não foi possível sair. Tente novamente.';
    }
};

onAuthStateChanged(auth, async user => {
    assinaturas.splice(0).forEach(parar => parar());
    ++versaoFicha;
    lista.replaceChildren();
    cartoes.clear();
    const ficha = document.getElementById('fichaMaquina');
    if (ficha.open) ficha.close();
    if (!user) {
        location.replace(login);
        return;
    }
    try {
        const perfil = (await get(ref(db, `usuarios/${user.uid}`))).val();
        if (auth.currentUser?.uid !== user.uid) return;
        if (perfil?.tipo !== 'tecnico') {
            if (perfil?.tipo === 'gestor') location.replace(new URL('manutencao.html' + location.search, location.href));
            else status.textContent = 'Esta área é reservada a técnicos autorizados.';
            return;
        }
        assinaturas.push(onValue(ref(db, 'catalogoPecas'), snapshot => {
            catalogo = snapshot.val() || {};
            cartoes.forEach(({ editor }) => editor?.atualizarCatalogo(catalogo));
        }, erro => {
            console.error(erro);
            status.textContent = 'Não foi possível carregar o catálogo de peças.';
        }));
        const minhasOrdens = query(ref(db, 'ordensServico'), orderByChild('tecnicoUid'), equalTo(user.uid));
        assinaturas.push(onValue(minhasOrdens, snapshot => {
            const ordenadas = Object.entries(snapshot.val() || {}).sort((a, b) => (b[1].criadoEm || 0) - (a[1].criadoEm || 0));
            const ids = new Set(ordenadas.map(([id]) => id));
            cartoes.forEach(({ card }, id) => {
                if (ids.has(id)) return;
                card.remove();
                cartoes.delete(id);
            });
            for (const [id, ordem] of ordenadas) {
                const chaveEstado = JSON.stringify([ordem.versao, ordem.execucao, ordem.status]);
                if (cartoes.get(id)?.chaveEstado === chaveEstado) continue;
                const anterior = cartoes.get(id)?.card;
                const novo = criarCartao(id, ordem, user);
                if (anterior) anterior.replaceWith(novo.card);
                else lista.append(novo.card);
                cartoes.set(id, { ...novo, chaveEstado });
            }
            status.textContent = ordenadas.length ? '' : 'Nenhuma ordem atribuída a você.';
            void mostrarFicha(ordenadas.map(([, ordem]) => ordem), ++versaoFicha);
        }, erro => {
            console.error(erro);
            lista.replaceChildren();
            cartoes.clear();
            status.textContent = 'Não foi possível consultar as ordens atribuídas.';
        }));
    } catch (erro) {
        console.error(erro);
        status.textContent = 'Não foi possível validar seu acesso.';
    }
});
