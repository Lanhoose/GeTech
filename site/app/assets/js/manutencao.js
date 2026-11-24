import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
    ref,
    onValue,
    push,
    set,
    update,
    get,
    serverTimestamp, increment
} from '../../../Site%20C/assets/js/banco-getech.js';
import { registrarAuditoria } from './auditoria.js';
import { editorPecas, resumoPecas } from './pecas-os.js';
import { anexarFoto, abrirFicha, idFicha, urlFicha } from './ficha-maquina.js';

const campo = id => document.getElementById(id);
const editor = editorPecas(campo('pecasOS'));
let tecnicos = {};
let estoqueOS;
let ordemDevolvida;
let gravandoOS = false;
const ordemLink = new URLSearchParams(location.search).get('os');
const etapas = { pendente: 'Pendente', 'em andamento': 'Em andamento', revisao: 'Aguardando revisão', concluido: 'Concluída' };
const etapa = os => os.execucao && os.status !== 'concluido' ? 'revisao' : os.status;
const faltas = (pecas, estoque) => Object.entries(pecas || {}).flatMap(([id, peca]) => {
    const saldo = Number(estoque[id]?.quantidade) || 0;
    return saldo < peca.quantidade ? [`${peca.nome}: faltam ${peca.quantidade - saldo} (saldo ${saldo})`] : [];
});

const BASE_URL = window.location.origin + '/GeTech';

let listaMaquinas = [];
let historicoOS = [];
let emModoEdicao = false;
let idMaquinaSendoEditada = null;
let versaoOS = 0;
let execucaoOS;
let idOSSendoEditada = null;
let usuarioAtual = null;
let listenersIniciados = false;

function escaparHTML(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function precisaManutencao(dataStr) {
    if (!dataStr) return false;
    const data = new Date(`${dataStr}T00:00:00`);
    if (Number.isNaN(data.getTime())) return false;
    const diffDias = (new Date() - data) / (1000 * 60 * 60 * 24);
    return diffDias > 90;
}

function formatarData(dataStr) {
    if (!dataStr) return '—';
    const partes = String(dataStr).split('-');
    if (partes.length !== 3) return String(dataStr);
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
}

function diasDesde(dataStr) {
    if (!dataStr) return null;
    const data = new Date(`${dataStr}T00:00:00`);
    if (Number.isNaN(data.getTime())) return null;
    return Math.floor((new Date() - data) / (1000 * 60 * 60 * 24));
}

function mostrarMensagem(id, mensagem, tipo = 'info') {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.innerHTML = mensagem;
    elemento.dataset.tipo = tipo;
}

function trocarTela(tela) {
    const sections = document.querySelectorAll('.card-app');
    const cardMaquinas = sections[0];
    const cardOS = sections[1];
    if (!cardMaquinas || !cardOS) return;

    if (tela === 'cadastro') {
        cardMaquinas.style.display = 'block';
        cardOS.style.display = 'none';
    } else {
        atualizarSelectMaquinas();
        cardMaquinas.style.display = 'none';
        cardOS.style.display = 'block';
    }
}
window.trocarTela = trocarTela;

function atualizarSelectMaquinas() {
    const select = document.querySelector('#maquinaOS');
    const aviso = document.querySelector('#avisoMaquinaOS');
    if (!select) return;

    const selecaoAtual = select.value;
    select.innerHTML = '';

    if (listaMaquinas.length === 0) {
        select.innerHTML = '<option value="">-- Nenhuma máquina cadastrada --</option>';
        select.disabled = true;
        if (aviso) aviso.style.display = 'block';
        return;
    }

    select.disabled = false;
    if (aviso) aviso.style.display = 'none';
    select.innerHTML = '<option value="">-- Selecione uma máquina --</option>';

    listaMaquinas.forEach((maquina) => {
        const opt = document.createElement('option');
        opt.value = maquina.id;
        opt.textContent = `${maquina.nome} — ${maquina.modelo} (Série: ${maquina.serie})`;
        select.appendChild(opt);
    });

    if (selecaoAtual && listaMaquinas.some(m => m.id === selecaoAtual)) {
        select.value = selecaoAtual;
    }
}

function exibirMaquinas(filtro = '') {
    const container = document.querySelector('#listaMaquina');
    if (!container) return;

    const termo = String(filtro).toLowerCase().trim();
    const filtradas = listaMaquinas.filter(m =>
        String(m.nome || '').toLowerCase().includes(termo)
    );

    container.innerHTML = '';
    if (filtradas.length === 0) {
        container.innerHTML = '<p style="color:#999; margin-top:12px;">Nenhuma máquina encontrada.</p>';
        return;
    }

    filtradas.forEach((m) => {
        const alerta = precisaManutencao(m.dataUltimaManutencao);
        const dias = diasDesde(m.dataUltimaManutencao);
        const badge = alerta
            ? '<span class="badge-alerta">⚠️ Manutenção Preventiva</span>'
            : '<span class="badge-ok">✔ Em dia</span>';
        const cardClass = alerta ? 'maq-card alerta' : 'maq-card ok';

        const card = document.createElement('div');
        card.className = cardClass;
        card.style.cssText = 'position: relative; padding-bottom: 40px;';
        card.innerHTML = `
            <strong>MAQ:</strong> ${escaparHTML(m.nome)} ${badge}
            &nbsp;|&nbsp; <strong>MOD:</strong> ${escaparHTML(m.modelo)}<br>
            <small style="color:#666;">
                Série: ${escaparHTML(m.serie)}
                &nbsp;·&nbsp;
                Última manutenção: ${formatarData(m.dataUltimaManutencao)}
                ${dias !== null ? `(${dias} dia${dias !== 1 ? 's' : ''} atrás)` : ''}
            </small>
        `;

        const botao = document.createElement('button');
        botao.className = 'btn-app btn-outline-app';
        botao.style.cssText = 'position: absolute; bottom: 8px; right: 8px; width: auto; padding: 4px 10px; font-size: 0.8rem;';
        botao.textContent = '✏️ Editar';
        botao.addEventListener('click', () => prepararEdicao(m.id));
        card.appendChild(botao);
        const ficha = document.createElement('a');
        ficha.href = urlFicha(m.id);
        ficha.textContent = 'Ficha e QR Code';
        ficha.style.display = 'block';
        card.appendChild(ficha);
        container.appendChild(card);
    });
}

async function prepararEdicao(id) {
    const maq = listaMaquinas.find(m => m.id === id);
    if (!maq) return;

    const campo_nomeMaquina=document.querySelector('#nomeMaquina'); if(campo_nomeMaquina) campo_nomeMaquina.value = maq.nome || '';
    const campo_modelo=document.querySelector('#modelo'); if(campo_modelo) campo_modelo.value = maq.modelo || '';
    const campo_numeroSerie=document.querySelector('#numeroSerie'); if(campo_numeroSerie) campo_numeroSerie.value = maq.serie || '';
    const campo_dataUltimaManutencao=document.querySelector('#dataUltimaManutencao'); if(campo_dataUltimaManutencao) campo_dataUltimaManutencao.value = maq.dataUltimaManutencao || '';

    campo('proximaPreventiva').value = maq.proximaPreventiva || '';
    emModoEdicao = true;
    idMaquinaSendoEditada = id;

    const btnSub = document.querySelector('#cadastroMaquinas button[type="submit"]');
    if (btnSub) {
        btnSub.textContent = '💾 Salvar Alterações';
        btnSub.style.background = '#27ae60';
    }

    document.querySelector('#cadastroMaquinas')?.scrollIntoView({ behavior: 'smooth' });
}
window.prepararEdicao = prepararEdicao;

async function salvarMaquina(dados) {
    if (!usuarioAtual) throw new Error('Usuário não autenticado.');

    if (emModoEdicao && idMaquinaSendoEditada) {
        const atualizacao = {
            ...dados,
            atualizadoEm: serverTimestamp(),
            atualizadoPor: usuarioAtual.uid
        };
        await update(ref(db, `maquinas/${idMaquinaSendoEditada}`), atualizacao);
        await registrarAuditoria('Manutenção: máquina atualizada', `Máquina ${atualizacao.nome || idMaquinaSendoEditada} atualizada.`, 'info');
        mostrarMensagem('dadosmaquina', `✅ Alterações em <strong>${escaparHTML(dados.nome)}</strong> salvas com sucesso!`);
    } else {
        const novaRef = push(ref(db, 'maquinas'));
        await set(novaRef, {
            ...dados,
            criadoEm: serverTimestamp(),
            atualizadoEm: serverTimestamp(),
            criadoPor: usuarioAtual.uid,
            atualizadoPor: usuarioAtual.uid
        });
        await registrarAuditoria('Manutenção: máquina cadastrada', `Máquina ${dados.nome || 'sem nome'} cadastrada.`, 'info');

        const alerta = precisaManutencao(dados.dataUltimaManutencao);
        mostrarMensagem(
            'dadosmaquina',
            alerta
                ? `✅ <strong>${escaparHTML(dados.nome)}</strong> cadastrado — ⚠️ <span style="color:#856404;">Manutenção preventiva recomendada (última há mais de 3 meses).</span>`
                : `✅ ${escaparHTML(dados.nome)} cadastrado com sucesso!`
        );
    }

    emModoEdicao = false;
    idMaquinaSendoEditada = null;
    const btnSub = document.querySelector('#cadastroMaquinas button[type="submit"]');
    if (btnSub) {
        btnSub.textContent = 'Cadastrar Equipamento';
        btnSub.style.background = '';
    }
    document.querySelector('#cadastroMaquinas')?.reset();
}

function exibirHistoricoOS() {
    const container = campo('listaOS');
    const maquina = campo('filtroMaquinaOS').value;
    const tecnico = campo('filtroTecnicoOS').value;
    const status = campo('filtroEtapaOS').value;
    container.replaceChildren();
    const ordens = historicoOS.filter(os => (!maquina || maquinaDaOrdem(os)?.id === maquina)
        && (!tecnico || (os.tecnicoUid || 'sem-tecnico') === tecnico)
        && (!status || etapa(os) === status));
    if (!ordens.length) container.textContent = 'Nenhuma ordem corresponde aos filtros.';

    for (const os of ordens) {
        const card = document.createElement('article');
        card.className = 'maq-card cartao-os';
        card.id = 'os-' + os.id;
        const titulo = document.createElement('h4');
        titulo.textContent = os.maquina;
        const info = document.createElement('p');
        info.textContent = [etapas[etapa(os)] || os.status, os.data, tecnicos[os.tecnicoUid]?.nome || tecnicos[os.tecnicoUid]?.email].filter(Boolean).join(' · ');
        const descricao = document.createElement('p');
        descricao.textContent = os.descricao;
        card.append(titulo, info, descricao);
        const pecas = os.status === 'concluido' ? os.pecas : os.execucao ? os.execucao.pecas : os.pecas;
        if (os.execucao?.relato || pecas) {
            const detalhe = document.createElement('p');
            detalhe.textContent = [os.execucao?.relato, resumoPecas(pecas)].filter(Boolean).join(' · ');
            card.append(detalhe);
            anexarFoto(card, os.execucao?.foto);
        }
        if (os.motivoDevolucao && etapa(os) === 'em andamento') {
            const motivo = document.createElement('p');
            motivo.textContent = 'Devolução: ' + os.motivoDevolucao;
            card.append(motivo);
        }
        const saldo = estoqueOS ? faltas(pecas, estoqueOS) : [];
        if (os.status !== 'concluido' && saldo.length) {
            const aviso = document.createElement('p');
            aviso.textContent = saldo.join(' · ');
            card.append(aviso);
        }
        if (os.status !== 'concluido') {
            const acoes = document.createElement('div');
            acoes.className = 'acoes-os';
            const editar = botaoOS('Editar', () => prepararEdicaoOS(os.id));
            acoes.append(editar);
            if (os.execucao || !os.tecnicoUid) {
                const concluir = botaoOS('Concluir', () => concluirCartao(os, pecas));
                concluir.disabled = Boolean(saldo.length);
                acoes.append(concluir);
            }
            if (os.execucao) acoes.append(botaoOS('Devolver', () => abrirDevolucao(os)));
            card.append(acoes);
        }
        container.append(card);
    }
    const alvo = ordemLink && document.getElementById('os-' + ordemLink);
    if (alvo && !linkDestacado) {
        linkDestacado = true;
        alvo.tabIndex = -1;
        alvo.focus();
        alvo.scrollIntoView({ block: 'center' });
    }
}
let linkDestacado = false;

function botaoOS(rotulo, acao) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-app btn-outline-app';
    botao.textContent = rotulo;
    botao.onclick = acao;
    return botao;
}

async function concluirCartao(os, pecas) {
    if (gravandoOS || !confirm('Concluir esta ordem e registrar a baixa das peças?')) return;
    gravandoOS = true;
    try {
        const maquina = maquinaDaOrdem(os);
        if (!maquina) throw new Error('Edite a ordem para vincular a máquina antes de concluir.');
        await salvarOrdemServico({
            maquina: maquina.nome, maquinaId: maquina.id, descricao: os.descricao,
            status: 'concluido', tecnicoUid: os.tecnicoUid || null, pecas: pecas || null
        }, { id: os.id, versao: os.versao || 0, execucao: os.execucao?.enviadoEm });
        campo('filtroOSStatus').textContent = 'Ordem concluída e estoque atualizado.';
    } catch (erro) {
        campo('filtroOSStatus').textContent = erro.code === 'PERMISSION_DENIED'
            ? 'A ordem ou o saldo mudou. Confira os dados atualizados.' : erro.message;
    } finally {
        gravandoOS = false;
    }
}

function abrirDevolucao(os) {
    ordemDevolvida = os;
    campo('formDevolverOS').reset();
    campo('devolucaoStatus').textContent = '';
    campo('devolverOS').showModal();
}

function maquinaDaOrdem(os) {
    if (os.maquinaId) return listaMaquinas.find(m => m.id === os.maquinaId);
    const candidatas = listaMaquinas.filter(m => m.nome === os.maquina);
    return candidatas.length === 1 ? candidatas[0] : undefined;
}

function prepararEdicaoOS(id) {
    const os = historicoOS.find(item => item.id === id);
    if (!os || os.status === 'concluido' || gravandoOS) return;
    if (idOSSendoEditada && !confirm('Substituir a edição aberta pelos dados atuais?')) return;

    atualizarSelectMaquinas();
    campo('maquinaOS').value = maquinaDaOrdem(os)?.id || '';
    campo('descricaoOS').value = os.descricao || '';
    campo('statusOS').value = os.status || 'pendente';
    campo('tecnicoOS').value = os.tecnicoUid || '';
    campo('tecnicoOS').disabled = Boolean(os.execucao);
    editor.preencher(os.execucao ? os.execucao.pecas : os.pecas);

    const revisao = campo('revisaoOS');
    revisao.replaceChildren();
    revisao.hidden = !os.execucao;
    if (os.execucao) {
        const relato = document.createElement('p');
        relato.textContent = os.execucao.relato;
        revisao.append('Relato do técnico', relato);
        anexarFoto(revisao, os.execucao.foto);
        revisao.append(botaoOS('Devolver para ajuste', () => abrirDevolucao(os)));
    }

    idOSSendoEditada = id;
    versaoOS = os.versao || 0;
    execucaoOS = os.execucao?.enviadoEm;
    campo('cancelarEdicaoOS').hidden = false;
    campo('ordemServico').querySelector('[type="submit"]').textContent = 'Salvar ordem';
    campo('ordemServico').scrollIntoView({ behavior: 'smooth' });
}

function limparEdicaoOS() {
    idOSSendoEditada = null;
    versaoOS = 0;
    execucaoOS = undefined;
    campo('ordemServico').reset();
    campo('tecnicoOS').disabled = false;
    campo('cancelarEdicaoOS').hidden = true;
    campo('revisaoOS').hidden = true;
    campo('ordemServico').querySelector('[type="submit"]').textContent = 'Abrir Ordem de Servi?o';
    editor.preencher(null);
}

async function salvarOrdemServico(dados, referencia = { id: idOSSendoEditada, versao: versaoOS, execucao: execucaoOS }) {
    const { id, versao, execucao } = referencia;
    const uid = usuarioAtual?.uid;
    if (!uid) throw new Error('Sess?o expirada.');
    const ordens = ref(db, 'ordensServico');
    if (!id) {
        if (dados.status === 'concluido') throw new Error('Abra a ordem antes de conclu?-la.');
        await set(push(ordens), {
            ...dados,
            data: new Date().toLocaleString('pt-BR'),
            criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp(),
            criadoPor: uid, atualizadoPor: uid, versao: 1
        });
        void registrarAuditoria('Manuten??o: ordem aberta', dados.maquina, 'info');
        return;
    }

    const ordem = ref(db, `ordensServico/${id}`);
    const atual = (await get(ordem)).val();
    if (!atual) throw new Error('Ordem indispon?vel.');
    if ((atual.status || atual.statusOs) === 'concluido') throw new Error('Esta ordem j? foi concluída.');
    if ((atual.versao || 0) !== versao || atual.execucao?.enviadoEm !== execucao) {
        throw new Error('A ordem mudou. Abra a edição novamente para revisar os dados.');
    }
    if (atual.execucao && dados.tecnicoUid !== atual.tecnicoUid) throw new Error('Devolva a revisão antes de trocar o técnico.');

    const campos = {
        ...dados,
        atualizadoEm: serverTimestamp(),
        atualizadoPor: uid,
        versao: versao + 1
    };

    if (dados.status !== 'concluido') {
        await update(ordem, campos);
        void registrarAuditoria('Manuten??o: ordem atualizada', `OS ${id} atualizada.`, 'info');
        return;
    }

    if ((atual.tecnicoUid || dados.tecnicoUid) && !atual.execucao) {
        throw new Error('Aguarde o técnico enviar a ordem para revisão antes de concluir.');
    }
    const estoque = (await get(ref(db, 'estoque'))).val() || {};
    const saldo = faltas(dados.pecas, estoque);
    if (saldo.length) throw new Error('Saldo insuficiente. ' + saldo.join(' · '));

    const chaveOrdem = `ordensServico/${id}`;
    const alteracoes = {};
    Object.entries({
        ...campos,
        encerradaEm: serverTimestamp(),
        encerradaPor: uid,
        revisaoConfirmadaEm: atual.execucao?.enviadoEm ?? null
    }).forEach(([chave, valor]) => { alteracoes[`${chaveOrdem}/${chave}`] = valor; });
    for (const [pecaId, peca] of Object.entries(dados.pecas || {})) {
        alteracoes[`estoque/${pecaId}/quantidade`] = increment(-peca.quantidade);
        alteracoes[`estoque/${pecaId}/atualizadoEm`] = new Date().toISOString();
        alteracoes[`estoque/${pecaId}/atualizadoPor`] = uid;
    }
    alteracoes[`movimentacoesOS/${id}`] = {
        encerradaEm: serverTimestamp(), gestorUid: uid, maquinaId: dados.maquinaId, pecas: dados.pecas
    };
    const logId = push(ref(db, 'auditoria')).key;
    alteracoes[`auditoria/${logId}`] = {
        id: logId, dataHora: new Date().toISOString(), usuario: usuarioAtual.email || uid, usuarioUid: uid,
        acao: 'Manuten??o: ordem concluída',
        detalhe: `OS ${id} ? ${dados.maquina}. ${resumoPecas(dados.pecas) || 'Sem pe?as utilizadas.'}`,
        criticidade: 'info', ordemServicoId: id
    };
    await update(ref(db), alteracoes);
}

function iniciarListenersFirebase() {
    if (listenersIniciados) return;
    listenersIniciados = true;

    onValue(ref(db, 'maquinas'), (snapshot) => {
        const dados = snapshot.val() || {};
        listaMaquinas = Object.entries(dados).map(([id, valor]) => ({
            ...valor, id,
            nome: valor.nome || valor.nomeMaquina,
            modelo: valor.modelo || valor.modeloMaquina,
            serie: valor.serie || valor.numeroDeSerie
        }));
        listaMaquinas.sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
        exibirMaquinas(document.querySelector('#buscaNomeMaquinas')?.value || '');
        atualizarSelectMaquinas();
        atualizarOpcoesConta(campo('filtroMaquinaOS'), Object.fromEntries(listaMaquinas.map(m => [m.id, m])), 'Todas as máquinas');
        exibirHistoricoOS();
        atualizarFicha();
    });

    onValue(ref(db, 'ordensServico'), (snapshot) => {
        const dados = snapshot.val() || {};
        historicoOS = Object.entries(dados).map(([id, valor]) => ({
            ...valor, id,
            maquina: valor.maquina || valor.maquinaOs || valor.maquinaOS,
            descricao: valor.descricao ?? valor.descricaoOs ?? valor.descricaoOS ?? '',
            status: valor.status || valor.statusOs || 'pendente',
            data: valor.data || (valor.criadoEm ? new Date(valor.criadoEm).toLocaleString('pt-BR') : '')
        }));
        historicoOS.sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0));
        if (ordemLink && !linkDestacado && !historicoOS.some(os => os.id === ordemLink)) {
            campo('filtroOSStatus').textContent = 'Ordem do link não encontrada.';
        } else if (ordemLink && !linkDestacado) {
            campo('filtroOSStatus').textContent = '';
        }
        const editada = historicoOS.find(os => os.id === idOSSendoEditada);
        if (idOSSendoEditada && !gravandoOS && (!editada || (editada.versao || 0) !== versaoOS || editada.execucao?.enviadoEm !== execucaoOS)) {
            mostrarMensagem('ordem_servico', 'Esta ordem mudou durante a edição. Seu texto foi preservado. Consulte a versão atual antes de salvar.', 'erro');
        }
        exibirHistoricoOS();
        atualizarFicha();
    }, erro => mostrarMensagem('ordem_servico', escaparHTML(erro.message), 'erro'));

    onValue(ref(db, 'estoque'), async snap => {
        const catalogo = Object.fromEntries(Object.entries(snap.val() || {}).map(([id, item]) => [id, item.nome]));
        estoqueOS = snap.val() || {};
        editor.atualizarCatalogo(catalogo);
        exibirHistoricoOS();
        try {
            const anterior = (await get(ref(db, 'catalogoPecas'))).val() || {};
            const mudancas = {};
            for (const [id, nome] of Object.entries(catalogo)) {
                if (typeof nome === 'string' && nome && anterior[id] !== nome) mudancas[id] = nome;
            }
            if (Object.keys(mudancas).length) await update(ref(db, 'catalogoPecas'), mudancas);
        } catch (erro) {
            console.error('N?o foi poss?vel sincronizar o cat?logo usado pelos técnicos.', erro);
            campo('acessoTecnicoStatus').textContent = 'N?o foi poss?vel sincronizar o cat?logo de pe?as.';
        }
    });

    onValue(ref(db, 'usuarios'), snap => {
        const contas = Object.entries(snap.val() || {});
        tecnicos = Object.fromEntries(contas.filter(([, perfil]) => perfil.tipo === 'tecnico'));
        const contasDisponiveis = Object.fromEntries(contas.filter(([, perfil]) => ['usuario', 'cliente'].includes(perfil.tipo)));
        atualizarOpcoesConta(campo('tecnicoOS'), tecnicos, 'Sem técnico atribu?do');
        atualizarOpcoesConta(campo('filtroTecnicoOS'), { 'sem-tecnico': { nome: 'Sem técnico' }, ...tecnicos }, 'Todos os técnicos');
        atualizarOpcoesConta(campo('contaTecnico'), contasDisponiveis, 'Selecione uma conta');
        exibirHistoricoOS();
    }, erro => {
        console.error(erro);
        campo('acessoTecnicoStatus').textContent = 'N?o foi poss?vel carregar as contas.';
    });
}

function atualizarFicha() {
    const maquina = listaMaquinas.find(m => m.id === idFicha);
    if (maquina) abrirFicha(maquina, historicoOS.filter(os => maquinaDaOrdem(os)?.id === maquina.id));
    else if (idFicha) mostrarMensagem('dadosmaquina', 'Máquina não encontrada.');
}

function atualizarOpcoesConta(select, contas, placeholder) {
    const selecionada = select.value;
    select.replaceChildren(new Option(placeholder, ''));
    Object.entries(contas).forEach(([id, perfil]) => select.add(new Option(perfil.email || perfil.nome || id, id)));
    select.value = Object.hasOwn(contas, selecionada) ? selecionada : '';
}

function configurarEventos() {
    ['filtroMaquinaOS', 'filtroTecnicoOS', 'filtroEtapaOS'].forEach(id => campo(id).onchange = exibirHistoricoOS);
    campo('cancelarDevolucao').onclick = () => campo('devolverOS').close();
    campo('formDevolverOS').onsubmit = async evento => {
        evento.preventDefault();
        const motivo = campo('motivoDevolucao').value.trim();
        if (!motivo || gravandoOS) return;
        const os = ordemDevolvida;
        gravandoOS = true;
        try {
            await update(ref(db, `ordensServico/${os.id}`), {
                execucao: null, status: 'em andamento', motivoDevolucao: motivo,
                revisaoDevolvidaEm: os.execucao.enviadoEm, versao: (os.versao || 0) + 1,
                atualizadoEm: serverTimestamp(), atualizadoPor: usuarioAtual.uid
            });
            campo('devolverOS').close();
            campo('filtroOSStatus').textContent = 'Ordem devolvida ao técnico.';
        } catch (erro) {
            campo('devolucaoStatus').textContent = 'A ordem mudou ou a devolução foi recusada.';
        } finally {
            gravandoOS = false;
        }
    };
    campo('cancelarEdicaoOS').onclick = limparEdicaoOS;
    campo('acessoTecnico').onsubmit = async (evento) => {
        evento.preventDefault();
        const botao = evento.currentTarget.querySelector('button');
        if (botao.disabled) return;
        botao.disabled = true;
        try {
            const id = campo('contaTecnico').value;
            if (!id) return;
            const perfilRef = ref(db, `usuarios/${id}`);
            const perfil = (await get(perfilRef)).val();
            if (!['usuario', 'cliente'].includes(perfil?.tipo)) throw new Error('A conta mudou. Atualize a lista.');
            await update(perfilRef, { tipo: 'tecnico' });
            campo('acessoTecnicoStatus').textContent = 'Acesso concedido. O técnico entra com a conta existente.';
            void registrarAuditoria('Manuten??o: acesso técnico concedido', perfil.email || id);
        } catch (erro) {
            console.error(erro);
            campo('acessoTecnicoStatus').textContent = 'N?o foi poss?vel conceder acesso.';
        } finally {
            botao.disabled = false;
        }
    };
    const formMaquinas = document.querySelector('#cadastroMaquinas');
    formMaquinas?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dados = {
            nome: document.querySelector('#nomeMaquina')?.value?.trim() || '',
            modelo: document.querySelector('#modelo')?.value?.trim() || '',
            serie: document.querySelector('#numeroSerie')?.value?.trim() || '',
            dataUltimaManutencao: document.querySelector('#dataUltimaManutencao')?.value || '',
            proximaPreventiva: campo('proximaPreventiva').value || null
        };
        try {
            await salvarMaquina(dados);
        } catch (erro) {
            console.error(erro);
            mostrarMensagem('dadosmaquina', `❌ Não foi possível salvar a máquina: ${escaparHTML(erro.message)}`, 'erro');
        }
    });

    document.querySelector('#btnBuscarMaquinas')?.addEventListener('click', () => {
        exibirMaquinas(document.querySelector('#buscaNomeMaquinas')?.value || '');
    });

    document.querySelector('#btnConsultarMaquinas')?.addEventListener('click', () => {
        const busca = document.querySelector('#buscaNomeMaquinas');
        if (busca) busca.value = '';
        exibirMaquinas();
    });

    const formOS = document.querySelector('#ordemServico');
    formOS?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const botao = formOS.querySelector('[type="submit"]');
        if (botao.disabled || gravandoOS) return;
        const maquina = listaMaquinas.find(item => item.id === campo('maquinaOS').value);
        const descricao = campo('descricaoOS').value.trim();
        if (!maquina || !descricao) {
            mostrarMensagem('ordem_servico', 'Selecione a máquina e informe a descri??o.', 'erro');
            return;
        }
        botao.disabled = true;
        gravandoOS = true;
        try {
            const status = campo('statusOS').value;
            await salvarOrdemServico({
                maquina: maquina.nome, maquinaId: maquina.id, descricao, status,
                tecnicoUid: campo('tecnicoOS').value || null,
                pecas: editor.ler()
            });
            limparEdicaoOS();
            mostrarMensagem('ordem_servico', status === 'concluido' ? 'Ordem concluída e estoque atualizado.' : 'Ordem salva.');
        } catch (erro) {
            console.error(erro);
            const mensagem = erro.code === 'PERMISSION_DENIED'
                ? 'Salvamento recusado. Confira se a ordem ou o saldo mudou e tente novamente.'
                : erro.message;
            mostrarMensagem('ordem_servico', escaparHTML(mensagem), 'erro');
        } finally {
            gravandoOS = false;
            botao.disabled = false;
        }
    });

    document.querySelector('#btnConsultarOS')?.addEventListener('click', exibirHistoricoOS);
}

function exportarExcel() {
    if (listaMaquinas.length === 0) {
        alert('Não há máquinas cadastradas para exportar.');
        return;
    }

    const maquinasExport = listaMaquinas.map(({ id, criadoEm, atualizadoEm, criadoPor, atualizadoPor, ...m }) => m);
    const osExport = historicoOS.map(({ id, criadoEm, atualizadoEm, criadoPor, atualizadoPor, ...os }) => os);
    const wsMaquinas = XLSX.utils.json_to_sheet(maquinasExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsMaquinas, 'Máquinas');
    if (osExport.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(osExport), 'Ordens de Serviço');
    XLSX.writeFile(wb, 'Relatorio_Manutencao_MAP.xlsx');
}
window.exportarExcel = exportarExcel;

function exportarPDF() {
    if (listaMaquinas.length === 0) {
        alert('Não há máquinas cadastradas para exportar.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('M.A.P - Relatório de Máquinas e Equipamentos', 14, 15);
    doc.setFontSize(10);
    doc.text('Gerado em: ' + new Date().toLocaleDateString('pt-BR'), 14, 22);

    const linhas = listaMaquinas.map(m => [m.nome, m.modelo, m.serie, formatarData(m.dataUltimaManutencao)]);
    doc.autoTable({
        head: [['Nome da Máquina', 'Modelo', 'Número de Série', 'Última Manutenção']],
        body: linhas,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [6, 100, 215] }
    });
    doc.save('Relatorio_Manutencao_MAP.pdf');
}
window.exportarPDF = exportarPDF;

function importarExcel(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            let importadosMaquinas = 0;
            let importadosOS = 0;

            if (workbook.SheetNames.includes('Máquinas')) {
                const dados = XLSX.utils.sheet_to_json(workbook.Sheets['Máquinas']);
                for (const maquina of dados) {
                    if (!maquina.nome) continue;
                    const novaRef = push(ref(db, 'maquinas'));
                    await set(novaRef, {
                        nome: String(maquina.nome),
                        modelo: String(maquina.modelo || ''),
                        serie: String(maquina.serie || maquina['Número de Série'] || ''),
                        proximaPreventiva: String(maquina.proximaPreventiva || ''),
                        dataUltimaManutencao: String(maquina.dataUltimaManutencao || maquina['Última Manutenção'] || ''),
                        criadoEm: serverTimestamp(),
                        atualizadoEm: serverTimestamp(),
                        criadoPor: usuarioAtual.uid,
                        atualizadoPor: usuarioAtual.uid
                    });
                    importadosMaquinas++;
                }
                if (importadosMaquinas) await registrarAuditoria('Manutenção: máquinas importadas', `${importadosMaquinas} máquina(s) importada(s) por planilha.`, 'info');
            }

            if (workbook.SheetNames.includes('Ordens de Serviço')) {
                const dados = XLSX.utils.sheet_to_json(workbook.Sheets['Ordens de Serviço']);
                for (const os of dados) {
                    if (!os.maquina) continue;
                    const novaRef = push(ref(db, 'ordensServico'));
                    await set(novaRef, {
                        maquina: String(os.maquina),
                        descricao: String(os.descricao || ''),
                        status: String(os.status || 'pendente'),
                        data: String(os.data || new Date().toLocaleString('pt-BR')),
                        criadoEm: serverTimestamp(),
                        atualizadoEm: serverTimestamp(),
                        criadoPor: usuarioAtual.uid,
                        atualizadoPor: usuarioAtual.uid
                    });
                    importadosOS++;
                }
                if (importadosOS) await registrarAuditoria('Manutenção: OS importadas', `${importadosOS} ordem(ns) de serviço importada(s) por planilha.`, 'info');
            }

            alert(`Importação concluída! ${importadosMaquinas} máquina(s) e ${importadosOS} ordem(ns) foram enviados ao Firebase.`);
        } catch (error) {
            console.error(error);
            alert('Erro ao ler ou salvar o arquivo Excel. Certifique-se de que é um formato válido.');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsArrayBuffer(file);
}
window.importarExcel = importarExcel;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert('Acesso restrito. Faça login para acessar este painel.');
        window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
        return;
    }

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const perfil = snap.exists() ? snap.val() : {};
        if (auth.currentUser?.uid !== user.uid) return;
        if (perfil.tipo !== 'gestor') {
            if (perfil.tipo === 'tecnico') {
                const url = new URL('tecnico.html', location.href);
                url.search = location.search;
                location.replace(url);
                return;
            }
            alert('Acesso restrito. Apenas gestores podem acessar este painel.');
            window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
            return;
        }

        usuarioAtual = user;
        configurarEventos();
        trocarTela(ordemLink ? 'estoque' : 'cadastro');
        iniciarListenersFirebase();
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível validar seu acesso.');
        window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
    }
});
