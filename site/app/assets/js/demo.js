const chave = 'getech-demonstracao-v1';
const inicial = { saldo: 5, etapa: 'aberta', relato: '', quantidade: 1 };
const campo = id => document.getElementById(id);
const form = campo('servico');
let estado = { ...inicial };

try {
    const salvo = JSON.parse(localStorage.getItem(chave));
    if (salvo && ['aberta', 'revisao', 'concluida'].includes(salvo.etapa)) estado = salvo;
} catch {
    // A sessão continua disponível se o navegador bloquear o armazenamento.
}

function renderizar(mensagem = '') {
    campo('saldo').textContent = `Filtro hidráulico: ${estado.saldo} unidades disponíveis.`;
    const rotulos = { aberta: 'Aberta', revisao: 'Aguardando revisão', concluida: 'Concluída' };
    campo('situacao').textContent = [rotulos[estado.etapa], estado.relato, mensagem].filter(Boolean).join(' · ');
    form.hidden = estado.etapa !== 'aberta';
    form.elements.relato.value = estado.relato;
    form.elements.quantidade.value = estado.quantidade;
    campo('revisao').hidden = estado.etapa !== 'revisao';
    campo('historico').textContent = estado.etapa === 'concluida'
        ? `Serviço concluído: ${estado.relato}. Baixa registrada: ${estado.quantidade} filtro(s).`
        : 'Nenhuma ordem concluída nesta demonstração.';
}

function atualizar(alteracoes, mensagem) {
    estado = { ...estado, ...alteracoes };
    try {
        localStorage.setItem(chave, JSON.stringify(estado));
    } catch {
        // Os dados permanecem disponíveis nesta página.
    }
    renderizar(mensagem);
}

form.onsubmit = evento => {
    evento.preventDefault();
    const relato = form.elements.relato.value.trim();
    if (!relato) return;
    atualizar({ etapa: 'revisao', relato, quantidade: form.elements.quantidade.valueAsNumber });
};

campo('concluir').onclick = () => {
    if (estado.etapa !== 'revisao') return;
    if (estado.quantidade > estado.saldo) {
        renderizar(`Estoque insuficiente. Faltam ${estado.quantidade - estado.saldo} filtros.`);
        return;
    }
    atualizar({ etapa: 'concluida', saldo: estado.saldo - estado.quantidade });
};

campo('devolver').onclick = () => atualizar({ etapa: 'aberta' }, 'Devolvida para ajuste.');
campo('reiniciar').onclick = () => atualizar(inicial);
renderizar();
