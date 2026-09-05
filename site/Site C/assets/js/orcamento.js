let totalGeral = 0;

    function adicionarItem() {
        const desc = document.getElementById('desc')?.value || '';
        const valor = parseFloat(document.getElementById('valor')?.value);
        const qtd = parseInt(document.getElementById('qtd')?.value || '0');

        if (!desc || isNaN(valor) || valor <= 0) {
            alert("Preencha os campos corretamente!");
            return;
        }

        const subtotal = valor * qtd;
        totalGeral += subtotal;

        const tabela = document.querySelector('#tabela tbody');
        if (!tabela) return;
        const novaLinha = document.createElement('tr');
        novaLinha.setAttribute('data-subtotal', subtotal);

        novaLinha.innerHTML = `
            <td>${desc}</td>
            <td>${qtd}</td>
            <td>R$ ${valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td>R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td><button class="btn-del" onclick="removerItem(this)">Excluir</button></td>
        `;

        tabela.appendChild(novaLinha);
        atualizarTotal();
        limparCampos();
    }

    function removerItem(botao) {
        const linha = botao.closest('tr');
        const subtotalLinha = parseFloat(linha.getAttribute('data-subtotal'));
        totalGeral -= subtotalLinha;
        linha.remove();
        atualizarTotal();
    }

    function atualizarTotal() {
        if (totalGeral < 0) totalGeral = 0;
        if (document.getElementById('valorTotal')) document.getElementById('valorTotal').innerText = totalGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2});
    }

    function limparCampos() {
        if (document.getElementById('desc')) document.getElementById('desc').value = '';
        if (document.getElementById('valor')) document.getElementById('valor').value = '';
        if (document.getElementById('qtd')) document.getElementById('qtd').value = '1';
        document.getElementById('desc')?.focus();
    }

    function limparTudo() {
        if(confirm("Limpar todo o orçamento?")) {
            const corpoTabela = document.querySelector('#tabela tbody'); if (corpoTabela) corpoTabela.innerHTML = '';
            totalGeral = 0;
            atualizarTotal();
        }
    }