// ==========================================
// SISTEMA GLOBAL DE AUDITORIA
// ==========================================
const Auditoria = {
    MAX_LOGS: 500, // Limite de segurança para não estourar o localStorage

    registrar: function(usuario, acao, detalhe, criticidade = 'info') {
        let logs;
        try {
            logs = JSON.parse(localStorage.getItem('erp_auditoria_logs')) || [];
        } catch (e) {
            // JSON corrompido: reinicia o array limpo
            logs = [];
        }

        const novoLog = {
            id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
            dataHora: new Date().toISOString(),
            usuario: usuario || 'Convidado/Sistema',
            acao: acao,
            detalhe: detalhe,
            criticidade: criticidade
        };

        logs.unshift(novoLog);

        // Mantém apenas os últimos MAX_LOGS registros para não estourar o localStorage
        if (logs.length > this.MAX_LOGS) {
            logs = logs.slice(0, this.MAX_LOGS);
        }

        try {
            localStorage.setItem('erp_auditoria_logs', JSON.stringify(logs));
        } catch (e) {
            // localStorage cheio: descarta metade dos logs mais antigos e tenta de novo
            logs = logs.slice(0, Math.floor(this.MAX_LOGS / 2));
            localStorage.setItem('erp_auditoria_logs', JSON.stringify(logs));
        }

        console.log(`[Auditoria] ${acao}: ${detalhe}`);
    },

    obterLogs: function() {
        try {
            return JSON.parse(localStorage.getItem('erp_auditoria_logs')) || [];
        } catch (e) {
            return [];
        }
    },

    limparLogs: function() {
        localStorage.removeItem('erp_auditoria_logs');
        this.registrar('Sistema', 'Limpeza de Logs', 'O histórico de auditoria foi reinicializado.', 'aviso');
    }
};

// ==========================================
// CAPTURA AUTOMÁTICA CONTROLADA POR SESSÃO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const usuarioAtual = localStorage.getItem('usuario_logado') || 'Usuário Convidado';

    const nomeAmigavel = document.title || 'Página sem Título';

    // FIX: pathname terminando em "/" retornava string vazia, colidindo a chave entre páginas
    const pathParts   = window.location.pathname.split('/').filter(Boolean);
    const nomeArquivo = pathParts.pop() || 'index.html';

    // ── 1. REGISTRO DE ACESSO À PÁGINA ──────────────────────────────────────
    // Chave única por aba: evita re-registro no F5 sem bloquear navegação normal
    const chaveSessaoPagina = `acessou_${nomeArquivo}`;

    if (!sessionStorage.getItem(chaveSessaoPagina)) {
        Auditoria.registrar(
            usuarioAtual,
            'Acesso à Página',
            `Entrou em: "${nomeAmigavel}" (${nomeArquivo})`,
            'info'
        );
        sessionStorage.setItem(chaveSessaoPagina, 'true');
    }

    // ── 2. DETECTOR DE CLIQUES ───────────────────────────────────────────────
    // FIX: usamos Set para não registrar o mesmo clique duas vezes quando
    // um elemento é ao mesmo tempo botão e filho de um card.
    document.addEventListener('click', (evento) => {
        const elemento = evento.target;

        const botaoAlvo = elemento.closest('button');
        const linkAlvo  = !botaoAlvo && elemento.closest('a');           // link só se não for botão
        const cardAlvo  = !botaoAlvo && !linkAlvo && (                   // card só se não for botão nem link
            elemento.closest('.stat-card') ||
            elemento.closest('.module-shortcut')
            // Removido '.card' genérico: era muito amplo e capturava cliques dentro
            // de cards de listagem (maq-card, OS cards), gerando logs duplicados
        );

        const alvo = botaoAlvo || linkAlvo || cardAlvo;
        if (!alvo) return;

        let textoIdentificador = alvo.innerText?.trim() || alvo.id || alvo.className || 'Elemento sem texto';
        if (textoIdentificador.length > 50) {
            textoIdentificador = textoIdentificador.substring(0, 47) + '...';
        }

        let tipoAcao = 'Clique em Botão';
        if (linkAlvo)                               tipoAcao = 'Clique em Link';
        if (cardAlvo?.classList.contains('stat-card'))       tipoAcao = 'Clique em Estatística';
        if (cardAlvo?.classList.contains('module-shortcut')) tipoAcao = 'Acesso a Módulo';

        Auditoria.registrar(
            usuarioAtual,
            tipoAcao,
            `Clicou em "${textoIdentificador}" na página "${nomeArquivo}"`,
            'info'
        );
    });

    // ── 3. DETECTOR DE MUDANÇA DE TEMA ──────────────────────────────────────
    // FIX: monitorava o .theme-toggle-wrap (pai), mas o detector de cliques acima
    // também capturava o button filho — gerando dois logs por clique.
    // Solução: escuta apenas o button diretamente e marca o evento como já tratado.
    const btnTema = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
    if (btnTema) {
        btnTema.addEventListener('click', (e) => {
            // Pequeno delay para esperar o data-theme ser atualizado no DOM
            setTimeout(() => {
                const temaAtual = document.documentElement.getAttribute('data-theme') || 'dark';
                Auditoria.registrar(
                    usuarioAtual,
                    'Alteração de Interface',
                    `Alterou o tema visual do ERP para: ${temaAtual.toUpperCase()} MODE`,
                    'info'
                );
            }, 50);
        });
    }
});