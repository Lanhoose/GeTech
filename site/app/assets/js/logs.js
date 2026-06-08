// Sistema Global de Auditoria
const Auditoria = {
    // Registra uma nova ação no histórico
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
        console.log(`[Auditoria] ${acao} registrado com sucesso.`);
    },

    // Obtém todos os logs salvos
    obterLogs: function() {
        return JSON.parse(localStorage.getItem('erp_auditoria_logs')) || [];
    },

    // Limpa o histórico de logs (útil para testes de desenvolvimento)
    limparLogs: function() {
        localStorage.removeItem('erp_auditoria_logs');
        this.registrar('Sistema', 'Limpeza de Logs', 'O histórico de auditoria foi reinicializado.', 'aviso');
    }
};

// Captura automática de eventos comuns ao carregar qualquer página que use este script
document.addEventListener("DOMContentLoaded", () => {
    // Registrar quando a página atual é acessada
    const tituloPagina = document.title;
    Auditoria.registrar('Usuário Atual', 'Acesso à Página', `Acessou: ${tituloPagina}`, 'info');

    // Escuta cliques em atalhos de módulos estruturais
    document.querySelectorAll('.module-shortcut').forEach(modulo => {
        modulo.addEventListener('click', () => {
            const nomeModulo = modulo.querySelector('h3')?.innerText || 'Desconhecido';
            Auditoria.registrar('Usuário Atual', 'Clique em Módulo', `Tentou acessar o módulo: ${nomeModulo}`, 'info');
        });
    });

    // Escuta cliques no botão de mudar tema (caso exista o botão na barra superior)
    const btnTema = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle-wrap');
    if (btnTema) {
        btnTema.addEventListener('click', () => {
            setTimeout(() => {
                const temaAtual = document.documentElement.getAttribute('data-theme') || 'dark';
                Auditoria.registrar('Usuário Atual', 'Alteração de Interface', `Mudou o tema visual para: ${temaAtual}`, 'info');
            }, 50);
        });
    }
}); 