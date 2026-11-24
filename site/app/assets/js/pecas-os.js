export function editorPecas(container) {
    const lista = container.querySelector('[data-pecas]');
    let catalogo = {};

    function preencher(select, id) {
        select.replaceChildren(new Option('Selecione uma peça', ''));
        Object.entries(catalogo)
            .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
            .forEach(([chave, nome]) => select.add(new Option(nome, chave)));
        if (id && !Object.hasOwn(catalogo, id)) select.add(new Option('Peça indisponível', id));
        select.value = id;
    }

    function adicionar(id = '', quantidade = 1) {
        const linha = document.createElement('div');
        linha.className = 'peca-linha';
        linha.innerHTML = `
            <select aria-label="Peça" required></select>
            <input type="number" aria-label="Quantidade" min="1" max="1000000" step="1" required>
            <button class="btn-app btn-outline-app" type="button">Remover</button>
        `;
        preencher(linha.querySelector('select'), id);
        linha.querySelector('input').value = quantidade;
        linha.querySelector('button').onclick = () => linha.remove();
        lista.append(linha);
    }

    container.querySelector('[data-adicionar-peca]').onclick = () => adicionar();
    return {
        atualizarCatalogo(novo) {
            catalogo = novo;
            lista.querySelectorAll('select').forEach(select => preencher(select, select.value));
        },
        preencher(pecas) {
            lista.replaceChildren();
            Object.entries(pecas || {}).forEach(([id, peca]) => adicionar(id, peca.quantidade));
        },
        ler() {
            const pecas = Object.create(null);
            for (const linha of lista.children) {
                const id = linha.querySelector('select').value;
                const quantidade = linha.querySelector('input').valueAsNumber;
                if (!Object.hasOwn(catalogo, id)) throw new Error('Selecione uma peça do catálogo.');
                if (!Number.isSafeInteger(quantidade) || quantidade < 1) throw new Error('Informe uma quantidade inteira positiva.');
                const total = (pecas[id]?.quantidade || 0) + quantidade;
                if (total > 1000000) throw new Error('A quantidade máxima por peça é 1.000.000.');
                pecas[id] = { nome: catalogo[id], quantidade: total };
            }
            return Object.keys(pecas).length ? { ...pecas } : null;
        }
    };
}

export function resumoPecas(pecas) {
    return Object.values(pecas || {}).map(({ nome, quantidade }) => `${nome} × ${quantidade}`).join(', ');
}
