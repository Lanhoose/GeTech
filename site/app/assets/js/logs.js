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
    limitToLast
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

const BASE_URL = window.location.origin + '/GeTech';

async function obterPerfilAtual(user) {
    if (!user) return null;
    const snap = await get(ref(db, `usuarios/${user.uid}`));
    return snap.exists() ? snap.val() : {};
}

export const Auditoria = {
    MAX_LOGS: 500,

    async registrar(usuario, acao, detalhe, criticidade = 'info') {
        try {
            const user = auth.currentUser;
            const perfil = await obterPerfilAtual(user);
            const nome = usuario || perfil?.nome || user?.displayName || user?.email || 'Convidado/Sistema';

            const novoLog = {
                id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                dataHora: new Date().toISOString(),
                usuario: nome,
                usuarioUid: user?.uid || null,
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
            console.error('[Auditoria] Erro ao registrar:', erro);
            return null;
        }
    },

    async obterLogs() {
        try {
            const consulta = query(ref(db, 'auditoria'), orderByChild('dataHora'), limitToLast(this.MAX_LOGS));
            const snap = await get(consulta);
            if (!snap.exists()) return [];

            return Object.entries(snap.val())
                .map(([firebaseId, log]) => ({ firebaseId, ...log }))
                .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
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

        entradas.sort(([, a], [, b]) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
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
        if (cardAlvo?.classList.contains('stat-card')) tipoAcao = 'Clique em Estatística';
        if (cardAlvo?.classList.contains('module-shortcut')) tipoAcao = 'Acesso a Módulo';

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

    const carregar = async () => {
        const logs = await Auditoria.obterLogs();
        window.dispatchEvent(new CustomEvent('getech:logs-updated', { detail: logs }));
        return logs;
    };

    window.addEventListener('getech:solicitar-logs', carregar);
    window.carregarLogsFirebase = carregar;
    await carregar();
}

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    await registrarAcessoAutomatico();
    iniciarDetectorCliques();
    iniciarDetectorTema();
    await iniciarPaginaLogs();
});

window.solicitarLogsFirebase = async function() {
    return Auditoria.obterLogs();
};
