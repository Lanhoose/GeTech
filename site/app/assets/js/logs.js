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

        logs.unshift(novoLog); // O mais recente aparece primeiro
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
        this.registrar('Sistema', 'Limpeza de Logs', 'O histórico de auditoria foi reinicializado.', 'aviso');
    }
};

// Captura Automática de Comportamento ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    // 1. Identificar quem está navegando (Busca a sessão simulada no localStorage)
    let usuarioAtual = localStorage.getItem('usuario_logado') || 'Usuário Convidado';
    
    // 2. PEGAR O NOME E ARQUIVO DA PÁGINA DINAMICAMENTE
    const nomeAmigavel = document.title || 'Página sem Título'; // Ex: "Sobre Nós - ERP Industrial"
    const nomeArquivo = window.location.pathname.split('/').pop() || 'index.html'; // Ex: "sobre.html"
    
    // 3. REGISTRAR O ACESSO AUTOMÁTICO
    // Isso vai disparar SEMPRE que qualquer página que tenha esse script for aberta!
    Auditoria.registrar(
        usuarioAtual, 
        'Acesso à Página', 
        `Entrou em: "${nomeAmigavel}" (${nomeArquivo})`, 
        'info'
    );

    // 4. EXTRA: Rastrear cliques em botões e links de forma genérica nesta página
    document.addEventListener('click', (evento) => {
        const elemento = evento.target;
        const ehBotao = elemento.tagName === 'BUTTON' || elemento.closest('button');
        const ehLink = elemento.tagName === 'A' || elemento.closest('a');

        if (ehBotao || ehLink) {
            const alvo = ehBotao ? (elemento.closest('button') || elemento) : (elemento.closest('a') || elemento);
            let textoBotao = alvo.innerText?.trim() || alvo.id || 'Sem rótulo';
            
            if (textoBotao.length > 40) textoBotao = textoBotao.substring(0, 37) + '...';

            Auditoria.registrar(
                usuarioAtual, 
                ehBotao ? 'Clique em Botão' : 'Clique em Link', 
                `Clicou em "${textoBotao}" de dentro da página "${nomeArquivo}"`, 
                'info'
            );
        }
    });

    // 5. EXTRA: Monitorar se o tema mudar (Sincronizado com o seu componente theme-toggle)
    const btnTema = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle-wrap');
    if (btnTema) {
        btnTema.addEventListener('click', () => {
            setTimeout(() => {
                const temaAtual = document.documentElement.getAttribute('data-theme') || 'dark';
                Auditoria.registrar(usuarioAtual, 'Alteração de Interface', `Alterou o tema visual para: ${temaAtual.toUpperCase()}`, 'info');
            }, 50);
        });
    }
});