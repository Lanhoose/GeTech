// Sistema Global de Auditoria Expandido e Inteligente
const Auditoria = {
    registrar: function(usuario, acao, detalhe, criticidade = 'info') {
        const logs = JSON.parse(localStorage.getItem('erp_auditoria_logs')) || [];
        
        const novoLog = {
            id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
            dataHora: new Date().toISOString(),
            usuario: usuario || 'Convidado/Sistema',
            acao: acao,
            detalhe: detalhe,
            criticidade: criticidade
        };

        logs.unshift(novoLog);
        localStorage.setItem('erp_auditoria_logs', JSON.stringify(logs));
        console.log(`[Auditoria] ${acao}: ${detalhe}`);
    },

    obterLogs: function() {
        return JSON.parse(localStorage.getItem('erp_auditoria_logs')) || [];
    },

    limparLogs: function() {
        localStorage.removeItem('erp_auditoria_logs');
        this.registrar('Sistema', 'Limpeza de Logs', 'O histórico de auditoria foi reinicializado.', 'aviso');
    }
};

// Captura Automática Controlada por Sessão
document.addEventListener("DOMContentLoaded", () => {
    let usuarioAtual = localStorage.getItem('usuario_logado') || 'Usuário Convidado';
    
    const nomeAmigavel = document.title || 'Página sem Título';
    const nomeArquivo = window.location.pathname.split('/').pop() || 'index.html';

    // CHAVE ÚNICA PARA EVITAR REPETIÇÃO NO RELOAD (F5)
    // Armazena no sessionStorage temporário da aba atual
    const chaveSessaoPagina = `acessou_${nomeArquivo}`;

    if (!sessionStorage.getItem(chaveSessaoPagina)) {
        // Se for a primeira vez que entra na página nesta sessão, registra o log!
        Auditoria.registrar(
            usuarioAtual, 
            'Acesso à Página', 
            `Entrou em: "${nomeAmigavel}" (${nomeArquivo})`, 
            'info'
        );
        // Marca que já registrou para não repetir no F5
        sessionStorage.setItem(chaveSessaoPagina, 'true');
    }

    // 2. DETECTOR DE CLIQUES EM BOTÕES E ELEMENTOS (Sempre ativo)
    document.addEventListener('click', (evento) => {
        const elemento = evento.target;
        
        // Captura botões, links, cards de módulo ou estatísticas
        const ehBotao = elemento.tagName === 'BUTTON' || elemento.closest('button');
        const ehLink = elemento.tagName === 'A' || elemento.closest('a');
        const ehCard = elemento.closest('.card') || elemento.closest('.stat-card') || elemento.closest('.module-shortcut');

        if (ehBotao || ehLink || ehCard) {
            const alvo = ehBotao ? (elemento.closest('button') || elemento) : 
                         ehLink ? (elemento.closest('a') || elemento) : ehCard;
            
            let textoIdentificador = alvo.innerText?.trim() || alvo.id || alvo.className || 'Elemento sem texto';
            
            // Tratamento para não pegar textos gigantescos de parágrafos inteiros
            if (textoIdentificador.length > 50) {
                textoIdentificador = textoIdentificador.substring(0, 47) + '...';
            }

            // Define o tipo de evento amigável na tabela
            let tipoAcao = 'Clique em Botão';
            if (ehLink) tipoAcao = 'Clique em Link';
            if (alvo.classList.contains('stat-card')) tipoAcao = 'Clique em Estatística';
            if (alvo.classList.contains('module-shortcut')) tipoAcao = 'Acesso a Módulo';

            Auditoria.registrar(
                usuarioAtual, 
                tipoAcao, 
                `Clicou em "${textoIdentificador}" na página "${nomeArquivo}"`, 
                'info'
            );
        }
    });

    // 3. DETECTOR DE MUDANÇA DE TEMA (DARK / LIGHT)
    // Monitora o clique no wrapper ou no botão de tema do layout.css
    const btnTema = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle-wrap');
    if (btnTema) {
        btnTema.addEventListener('click', () => {
            // Pequeno delay para esperar o script do seu ERP alterar o data-theme no HTML
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