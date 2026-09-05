import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
    ref,
    onValue,
    push,
    set,
    update,
    get,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';
import { registrarAuditoria } from './auditoria.js';

const BASE_URL = window.location.origin + '/GeTech';

let listaMaquinas = [];
let historicoOS = [];
let emModoEdicao = false;
let idMaquinaSendoEditada = null;
let emModoEdicaoOS = false;
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
        opt.value = maquina.nome;
        opt.textContent = `${maquina.nome} — ${maquina.modelo} (Série: ${maquina.serie})`;
        select.appendChild(opt);
    });

    if (selecaoAtual && listaMaquinas.some(m => m.nome === selecaoAtual)) {
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
        container.appendChild(card);
    });
}

async function prepararEdicao(id) {
    const maq = listaMaquinas.find(m => m.id === id);
    if (!maq) return;

    document.querySelector('#nomeMaquina').value = maq.nome || '';
    document.querySelector('#modelo').value = maq.modelo || '';
    document.querySelector('#numeroSerie').value = maq.serie || '';
    document.querySelector('#dataUltimaManutencao').value = maq.dataUltimaManutencao || '';

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
    const container = document.querySelector('#listaOS');
    if (!container) return;
    container.innerHTML = '';

    if (historicoOS.length === 0) {
        container.innerHTML = '<p style="color:#999; margin-top:12px;">Nenhuma ordem registrada ainda.</p>';
        return;
    }

    historicoOS.forEach((os) => {
        const cor = os.status === 'concluido'
            ? '#27ae60'
            : os.status === 'em andamento'
                ? '#f39c12'
                : '#e74c3c';

        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid var(--mod-input-border,#ddd); padding:15px; padding-bottom:45px; margin-top:10px; border-radius:6px; position:relative; background:var(--mod-card-bg,white);';
        card.innerHTML = `
            <span style="position:absolute; top:15px; right:15px; color:${cor}; font-weight:bold; font-size:0.8rem; text-transform:uppercase;">
                ● ${escaparHTML(os.status)}
            </span>
            <strong>Equipamento:</strong> ${escaparHTML(os.maquina)}<br>
            <p style="margin:5px 0; color:var(--mod-label,#555);">${escaparHTML(os.descricao)}</p>
            <small style="color:#999;">Data: ${escaparHTML(os.data)}</small>
        `;

        const botao = document.createElement('button');
        botao.className = 'btn-app btn-outline-app';
        botao.style.cssText = 'position:absolute; bottom:8px; right:8px; width:auto; padding:4px 10px; font-size:0.8rem;';
        botao.textContent = '✏️ Editar';
        botao.addEventListener('click', () => prepararEdicaoOS(os.id));
        card.appendChild(botao);
        container.appendChild(card);
    });
}

function prepararEdicaoOS(id) {
    const os = historicoOS.find(item => item.id === id);
    if (!os) return;

    atualizarSelectMaquinas();
    document.querySelector('#maquinaOS').value = os.maquina || '';
    document.querySelector('#descricaoOS').value = os.descricao || '';
    document.querySelector('#statusOS').value = os.status || 'pendente';

    emModoEdicaoOS = true;
    idOSSendoEditada = id;

    const btnSub = document.querySelector('#ordemServico button[type="submit"]');
    if (btnSub) {
        btnSub.textContent = '💾 Salvar Alterações';
        btnSub.style.background = '#27ae60';
    }

    document.querySelector('#ordemServico')?.scrollIntoView({ behavior: 'smooth' });
}
window.prepararEdicaoOS = prepararEdicaoOS;
window.exibirHistoricoOS = exibirHistoricoOS;

async function salvarOrdemServico(dados) {
    if (!usuarioAtual) throw new Error('Usuário não autenticado.');

    if (emModoEdicaoOS && idOSSendoEditada) {
        const atual = historicoOS.find(item => item.id === idOSSendoEditada);
        await update(ref(db, `ordensServico/${idOSSendoEditada}`), {
            ...dados,
            data: atual?.data || new Date().toLocaleString('pt-BR'),
            atualizadoEm: serverTimestamp(),
            atualizadoPor: usuarioAtual.uid
        });
        await registrarAuditoria('Manutenção: ordem de serviço atualizada', `OS ${idOSSendoEditada} atualizada.`, 'info');
        mostrarMensagem('ordem_servico', '✅ Ordem de Serviço atualizada com sucesso!');
    } else {
        const novaRef = push(ref(db, 'ordensServico'));
        await set(novaRef, {
            ...dados,
            data: new Date().toLocaleString('pt-BR'),
            criadoEm: serverTimestamp(),
            atualizadoEm: serverTimestamp(),
            criadoPor: usuarioAtual.uid,
            atualizadoPor: usuarioAtual.uid
        });
        await registrarAuditoria('Manutenção: ordem de serviço criada', `OS da máquina ${dados.maquina || 'sem máquina'} criada.`, 'info');
        mostrarMensagem('ordem_servico', '🚀 Ordem de Serviço aberta com sucesso!');
    }

    emModoEdicaoOS = false;
    idOSSendoEditada = null;
    const btnSub = document.querySelector('#ordemServico button[type="submit"]');
    if (btnSub) {
        btnSub.textContent = 'Abrir Ordem de Serviço';
        btnSub.style.background = '';
    }
    document.querySelector('#ordemServico')?.reset();
}

function iniciarListenersFirebase() {
    if (listenersIniciados) return;
    listenersIniciados = true;

    onValue(ref(db, 'maquinas'), (snapshot) => {
        const dados = snapshot.val() || {};
        listaMaquinas = Object.entries(dados).map(([id, valor]) => ({ id, ...valor }));
        listaMaquinas.sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
        exibirMaquinas(document.querySelector('#buscaNomeMaquinas')?.value || '');
        atualizarSelectMaquinas();
    });

    onValue(ref(db, 'ordensServico'), (snapshot) => {
        const dados = snapshot.val() || {};
        historicoOS = Object.entries(dados).map(([id, valor]) => ({ id, ...valor }));
        historicoOS.sort((a, b) => String(b.data || '').localeCompare(String(a.data || ''), 'pt-BR'));
        exibirHistoricoOS();
    });
}

function configurarEventos() {
    const formMaquinas = document.querySelector('#cadastroMaquinas');
    formMaquinas?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dados = {
            nome: document.querySelector('#nomeMaquina').value.trim(),
            modelo: document.querySelector('#modelo').value.trim(),
            serie: document.querySelector('#numeroSerie').value.trim(),
            dataUltimaManutencao: document.querySelector('#dataUltimaManutencao').value
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
        const maquina = document.querySelector('#maquinaOS')?.value;
        if (!maquina) {
            mostrarMensagem('ordem_servico', '⚠️ Selecione uma máquina válida antes de abrir a Ordem de Serviço.', 'erro');
            return;
        }

        const dados = {
            maquina,
            descricao: document.querySelector('#descricaoOS').value.trim(),
            status: document.querySelector('#statusOS').value
        };

        try {
            await salvarOrdemServico(dados);
        } catch (erro) {
            console.error(erro);
            mostrarMensagem('ordem_servico', `❌ Não foi possível salvar a Ordem de Serviço: ${escaparHTML(erro.message)}`, 'erro');
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
        if (perfil.tipo !== 'gestor') {
            alert('Acesso restrito. Apenas gestores podem acessar este painel.');
            window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
            return;
        }

        usuarioAtual = user;
        configurarEventos();
        trocarTela('cadastro');
        iniciarListenersFirebase();
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível validar seu acesso.');
        window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
    }
});
