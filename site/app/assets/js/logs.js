// Sistema Global de Auditoria Expandido
const Auditoria = {
    // Registra uma nova ação no histórico (salva no localStorage)
    registrar: function(usuario, acao, detalhe, criticidade = 'info') {
        const logs = JSON.parse(localStorage.getItem('erp_auditoria_logs')) || [];
        
        const novoLog = {
            id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
            dataHora: new Date().toISOString(),
            usuario: usuario || 'Convidado/Sistema',
            acao: acao,
            detalhe: detalhe,
            criticidade: criticidade // 'info', 'aviso', 'critico'
        };

        logs.unshift(novoLog); // Adiciona no início para o mais recente aparecer primeiro
        localStorage.setItem('erp_auditoria_logs', JSON.stringify(logs));
        console.log(`[Auditoria] ${acao}: ${detalhe}`);
    },

    // Obtém todos os logs salvos
    obterLogs: function() {
        return JSON.parse(localStorage.getItem('erp_auditoria_logs')) || [];
    },

    // Limpa o histórico de logs
    limparLogs: function() {
        localStorage.removeItem('erp_auditoria_logs');
        this.registrar('Sistema', 'Limpeza de Logs', 'O histórico de auditoria foi reinicializado pelo administrador.', 'aviso');
    }
};

// Captura Automática de Comportamento e Navegação
document.addEventListener("DOMContentLoaded", () => {
    // 1. Identificar o usuário logado (Busca do localStorage se houver, ou define como Convidado)
    let usuarioAtual = localStorage.getItem('usuario_logado') || 'Usuário Convidado';
    
    // 2. Rastrear em qual página o usuário está assim que ela carrega
    const nomePagina = document.title || 'Página Desconhecida';
    const urlPagina = window.location.pathname.split('/').pop() || 'index.html';
    Auditoria.registrar(usuarioAtual, 'Navegação', `Acessou a página: "${nomePagina}" (${urlPagina})`, 'info');

    // 3. Rastrear cliques em QUALQUER botão ou elemento clicável de forma dinâmica
    document.addEventListener('click', (evento) => {
        const elemento = evento.target;
        
        // Verifica se o clique foi em um botão, link ou item com classe de ação
        const ehBotao = elemento.tagName === 'BUTTON' || elemento.closest('button');
        const ehLink = elemento.tagName === 'A' || elemento.closest('a');
        const ehModulo = elemento.classList.contains('module-shortcut') || elemento.closest('.module-shortcut');
        const ehCardStat = elemento.classList.contains('stat-card') || elemento.closest('.stat-card');

        if (ehBotao || ehLink || ehModulo || ehCardStat) {
            const alvo = ehBotao ? (elemento.closest('button') || elemento) : 
                         ehLink ? (elemento.closest('a') || elemento) :
                         ehModulo ? (elemento.closest('.module-shortcut') || elemento) : (elemento.closest('.stat-card') || elemento);
            
            // Tenta descobrir o nome amigável do botão/elemento
            let identificadorBotao = alvo.innerText?.trim() || alvo.id || alvo.getAttribute('aria-label') || 'Sem texto';
            
            // Evita textos gigantescos recortando se passar de 40 caracteres
            if (identificadorBotao.length > 40) {
                identificadorBotao = identificadorBotao.substring(0, 37) + '...';
            }

            // Define o tipo de ação com base no elemento clicado
            let tipoAcao = 'Clique em Botão';
            if (ehLink) tipoAcao = 'Clique em Link';
            if (ehModulo) tipoAcao = 'Acesso a Módulo';
            if (ehCardStat) tipoAcao = 'Clique em Estatística';

            Auditoria.registrar(usuarioAtual, tipoAcao, `Clicou em: "${identificadorBotao}" na página "${nomePagina}"`, 'info');
        }
    });

    // 4. Rastrear mudanças de tema (Dark / Light) monitorando o botão do tema
    // Se o seu botão de tema tiver um ID ou classe diferente, me avise para ajustarmos!
    const btnTema = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle-wrap') || document.querySelector('.btn-theme');
    
    if (btnTema) {
        btnTema.addEventListener('click', () => {
            // Aguarda um milissegundo para o script principal alterar o atributo do HTML antes de lermos
            setTimeout(() => {
                const novoTema = document.documentElement.getAttribute('data-theme') || 'dark';
                Auditoria.registrar(usuarioAtual, 'Alteração de Interface', `Mudou o tema visual do ERP para: ${novoTema.toUpperCase()} MODE`, 'info');
            }, 50);
        });
    }
});