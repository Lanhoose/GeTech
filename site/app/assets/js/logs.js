import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
    ref,
    push,
    set,
    get,
    remove,
    query,
    orderByChild,
    limitToLast,
    onValue
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

const BASE_URL = window.location.origin + '/GeTech';

// Cache do perfil para não ler /usuarios/<uid> a cada clique.
let perfilEmCache = { uid: null, perfil: null };

async function obterPerfilAtual(user) {
    if (!user) return null;

    if (perfilEmCache.uid === user.uid && perfilEmCache.perfil) {
        return perfilEmCache.perfil;
    }

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const perfil = snap.exists() ? snap.val() : {};
        perfilEmCache = { uid: user.uid, perfil };
        return perfil;
    } catch (erro) {
        console.warn('[Auditoria] Não foi possível ler o perfil do usuário.');
        return null;
    }
}

// Somente gestores podem escrever em "auditoria" (ver database.rules.json).
function perfilEhGestor(perfil) {
    return String(perfil?.tipo || '').toLowerCase() === 'gestor';
}

// Converte qualquer formato de log (antigo ou novo) para o formato padrão da tela:
// { id, dataHora (ISO), usuario, acao, detalhe, criticidade }.
// Logs antigos gravados por registrarAuditoria() usavam descricao/nivel/data
// e dataHora numérico — sem isso apareciam como "undefined".
function normalizarLog(firebaseId, log = {}) {
    let dataHora = log.dataHora ?? log.data ?? null;
    const ts = typeof dataHora === 'number' ? dataHora : new Date(dataHora).getTime();
    dataHora = Number.isFinite(ts) ? new Date(ts).toISOString() : '';

    return {
        ...log,
        firebaseId,
        id: log.id || firebaseId,
        dataHora,
        usuario: log.usuario || 'Sistema',
        usuarioEmail: log.usuarioEmail || (String(log.usuario || '').includes('@') ? log.usuario : ''),
        acao: log.acao || 'Evento',
        detalhe: log.detalhe ?? log.descricao ?? '',
        criticidade: String(log.criticidade ?? log.nivel ?? 'info').toLowerCase()
    };
}

function logsDoSnapshot(valor) {
    return Object.entries(valor || {})
        .map(([firebaseId, log]) => normalizarLog(firebaseId, log))
        .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
}

export const Auditoria = {
    MAX_LOGS: 500,

    async registrar(usuario, acao, detalhe, criticidade = 'info') {
        try {
            const user = auth.currentUser;
            if (!user) return null; // visitante: não grava

            const perfil = await obterPerfilAtual(user);

            // Cliente/usuário comum: as Rules bloqueiam a escrita em "auditoria".
            // Sai em silêncio para não gerar PERMISSION_DENIED no console.
            if (!perfilEhGestor(perfil)) return null;

            const nome = usuario || perfil?.nome || user.displayName || user.email || 'Convidado/Sistema';

            const novoLog = {
                id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                dataHora: new Date().toISOString(),
                usuario: nome,
                usuarioUid: user?.uid || null,
                usuarioEmail: user?.email || '',
                acao: acao || 'Evento',
                detalhe: detalhe || '',
                criticidade: criticidade || 'info'
            };

            const novaRef = push(ref(db, 'auditoria'));
            await set(novaRef, novoLog);
            console.log(`[Auditoria] ${novoLog.acao}: ${novoLog.detalhe}`);

            await podarLogs();
            return novoLog;
        } catch (erro) {
            if (erro?.code === 'PERMISSION_DENIED' || String(erro?.message || '').includes('PERMISSION_DENIED')) {
                console.warn('[Auditoria] Registro não permitido pelas Rules.');
            } else {
                console.error('[Auditoria] Erro ao registrar:', erro);
            }
            return null;
        }
    },

    async obterLogs() {
        try {
            const consulta = query(ref(db, 'auditoria'), orderByChild('dataHora'), limitToLast(this.MAX_LOGS));
            const snap = await get(consulta);
            if (!snap.exists()) return [];

            return logsDoSnapshot(snap.val());
        } catch (erro) {
            console.error('[Auditoria] Erro ao obter logs:', erro);
            return [];
        }
    },

    async limparLogs() {
        try {
            await remove(ref(db, 'auditoria'));
            console.log('[Auditoria] Histórico de auditoria apagado.');
            return true;
        } catch (erro) {
            console.error('[Auditoria] Erro ao limpar logs:', erro);
            return false;
        }
    }
};
window.Auditoria = Auditoria;

async function podarLogs() {
    try {
        const snap = await get(ref(db, 'auditoria'));
        if (!snap.exists()) return;
        const entradas = Object.entries(snap.val());
        if (entradas.length <= Auditoria.MAX_LOGS) return;

        entradas.sort(([, a], [, b]) => new Date(normalizarLog('', a).dataHora).getTime() - new Date(normalizarLog('', b).dataHora).getTime());
        const quantidadeRemover = entradas.length - Auditoria.MAX_LOGS;
        await Promise.all(
            entradas.slice(0, quantidadeRemover).map(([id]) => remove(ref(db, `auditoria/${id}`)))
        );
    } catch (erro) {
        console.error('[Auditoria] Erro ao podar logs:', erro);
    }
}

async function obterNomeUsuario(user) {
    const perfil = await obterPerfilAtual(user);
    return perfil?.nome || user?.displayName || user?.email || 'Usuário Convidado';
}

async function registrarAcessoAutomatico() {
    const user = auth.currentUser;
    if (!user) return;

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const nomeArquivo = pathParts.pop() || 'index.html';
    const chaveSessaoPagina = `acessou_${nomeArquivo}`;

    if (!sessionStorage.getItem(chaveSessaoPagina)) {
        const nomeUsuario = await obterNomeUsuario(user);
        await Auditoria.registrar(
            nomeUsuario,
            'Acesso à Página',
            `Entrou em: "${document.title || 'Página sem Título'}" (${nomeArquivo})`,
            'info'
        );
        sessionStorage.setItem(chaveSessaoPagina, 'true');
    }
}

function iniciarDetectorCliques() {
    document.addEventListener('click', async (evento) => {
        const elemento = evento.target instanceof Element ? evento.target : null;
        if (!elemento || elemento.dataset?.auditoriaIgnorar === 'true') return;

        const botaoAlvo = elemento.closest('button');
        const linkAlvo = !botaoAlvo && elemento.closest('a');
        const cardAlvo = !botaoAlvo && !linkAlvo && (
            elemento.closest('.stat-card') ||
            elemento.closest('.module-shortcut')
        );

        const alvo = botaoAlvo || linkAlvo || cardAlvo;
        if (!alvo) return;

        let texto = alvo.innerText?.trim() || alvo.id || alvo.className || 'Elemento sem texto';
        if (texto.length > 50) texto = texto.substring(0, 47) + '...';

        let tipoAcao = 'Clique em Botão';
        if (linkAlvo) tipoAcao = 'Clique em Link';
        if (cardAlvo?.classList?.contains('stat-card')) tipoAcao = 'Clique em Estatística';
        if (cardAlvo?.classList?.contains('module-shortcut')) tipoAcao = 'Acesso a Módulo';

        const nomeUsuario = await obterNomeUsuario(auth.currentUser);
        Auditoria.registrar(
            nomeUsuario,
            tipoAcao,
            `Clicou em "${texto}" na página "${window.location.pathname.split('/').filter(Boolean).pop() || 'index.html'}"`,
            'info'
        );
    });
}

function iniciarDetectorTema() {
    const btnTema = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
    if (!btnTema) return;
    btnTema.addEventListener('click', () => {
        setTimeout(async () => {
            const temaAtual = document.documentElement.getAttribute('data-theme') || 'dark';
            const nomeUsuario = await obterNomeUsuario(auth.currentUser);
            Auditoria.registrar(
                nomeUsuario,
                'Alteração de Interface',
                `Alterou o tema visual para: ${temaAtual.toUpperCase()} MODE`,
                'info'
            );
        }, 100);
    });
}

async function iniciarPaginaLogs() {
    if (!document.getElementById('log-table-body')) return;

    const atualizarTela = (logs) => {
        // Atualiza a página de logs imediatamente. O evento continua sendo
        // disparado para manter compatibilidade com a implementação existente.
        window.dispatchEvent(new CustomEvent('getech:logs-updated', { detail: logs }));

        // Fallback direto: evita qualquer corrida entre o callback do Firebase
        // e o listener do HTML. Assim a tabela muda sem precisar de F5.
        if (typeof window.renderizarLogs === 'function') {
            const texto = document.getElementById('filtroTexto')?.value?.toLowerCase().trim() || '';
            const criticidade = document.getElementById('filtroCriticidade')?.value || '';
            const dataInicio = document.getElementById('filtroDataInicio')?.value || '';
            const dataFim = document.getElementById('filtroDataFim')?.value || '';

            const filtrados = logs.filter(log => {
                const haystack = [log.id, log.usuario, log.usuarioEmail, log.acao, log.detalhe].join(' ').toLowerCase();
                if (texto && !haystack.includes(texto)) return false;
                if (criticidade && log.criticidade !== criticidade) return false;

                const dataLog = String(log.dataHora || '').slice(0, 10);
                if (dataInicio && dataLog < dataInicio) return false;
                if (dataFim && dataLog > dataFim) return false;

                return true;
            });

            window.renderizarLogs(filtrados);
        }
    };

    const carregar = async () => {
        const logs = await Auditoria.obterLogs();
        atualizarTela(logs);
        return logs;
    };

    // Escuta o Firebase em tempo real: qualquer novo log, alteração ou exclusão
    // atualiza a tabela automaticamente, sem F5.
    const consulta = query(
        ref(db, 'auditoria'),
        orderByChild('dataHora'),
        limitToLast(Auditoria.MAX_LOGS)
    );

    onValue(consulta, (snapshot) => {
        const logs = snapshot.exists() ? logsDoSnapshot(snapshot.val()) : [];

        atualizarTela(logs);
        console.log(`[Auditoria] ${logs.length} logs sincronizados em tempo real.`);
    }, (erro) => {
        console.error('[Auditoria] Erro na sincronização em tempo real:', erro);
    });

    window.addEventListener('getech:solicitar-logs', carregar);
    window.carregarLogsFirebase = carregar;
    await carregar();
}

// onAuthStateChanged dispara mais de uma vez (refresh de token, re-login).
// Sem esta trava os detectores eram registrados de novo e cada clique gerava
// dois ou mais logs duplicados.
let detectoresIniciados = false;

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    await registrarAcessoAutomatico();

    if (!detectoresIniciados) {
        detectoresIniciados = true;
        iniciarDetectorCliques();
        iniciarDetectorTema();
        await iniciarPaginaLogs();
    }
});

window.solicitarLogsFirebase = async function() {
    return Auditoria.obterLogs();
};