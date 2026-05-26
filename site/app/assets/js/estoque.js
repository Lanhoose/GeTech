// Variáveis Globais (Mantêm os dados enquanto a página não recarrega)
let estoqueAtual = 0;
let nomeProdutoAtual = "";

// 1. Função de Troca de Telas (Aula 3 & 4)
function trocarTela(tela) {
    const telaCadastro = document.querySelector("#tela-cadastro");
    const telaEstoque = document.querySelector("#tela-estoque");

    if (tela === 'cadastro') {
        telaCadastro.style.display = "block";
        telaEstoque.style.display = "none";
    } else {
        telaCadastro.style.display = "none";
        telaEstoque.style.display = "block";
    }
}

// 2. Lógica de Cadastro e Tabela (Aula 4)
const btnRegistrar = document.querySelector("#btnRegistrar");

if (btnRegistrar) {
    btnRegistrar.addEventListener("click", () => {
        const nome = document.querySelector("#nomeItem").value;
        const qtd = Number(document.querySelector("#qtdItem").value);

        if (nome !== "" && qtd > 0) {
            const tabela = document.querySelector("#corpoTabela");

            const linha = `
                <tr>
                    <td>${nome}</td>
                    <td>${qtd}</td>
                    <td><button onclick="carregarParaEstoque('${nome}', ${qtd})">Gerenciar</button></td>
                </tr>
            `;

            tabela.innerHTML += linha;

            document.querySelector("#nomeItem").value = "";
            document.querySelector("#qtdItem").value = "";
        } else {
            alert("Preencha os dados corretamente!");
        }
    });
}

// 3. Função para "Enviar" o item da tabela para a área de estoque
function carregarParaEstoque(nome, qtd) {
    nomeProdutoAtual = nome;
    estoqueAtual = qtd;

    // Atualiza os textos da Tela 2
    document.querySelector("#produtoSelecionado").textContent = "Item: " + nomeProdutoAtual;
    document.querySelector("#visorQtd").textContent = estoqueAtual;

    // Muda automaticamente para a tela de estoque para o usuário ver
    trocarTela('estoque');
}

// 4. Lógica de Entrada e Saída (Aula 1 & 2)
const btnEntrada = document.querySelector("#btnEntrada");
const btnSaida = document.querySelector("#btnSaida");

btnEntrada.addEventListener("click", () => {
    let valor = Number(document.querySelector("#valorMovimentacao").value);
    estoqueAtual += valor;
    atualizarVisor();
});

btnSaida.addEventListener("click", () => {
    let valor = Number(document.querySelector("#valorMovimentacao").value);
    if (valor <= estoqueAtual) {
        estoqueAtual -= valor;
        atualizarVisor();
    } else {
        alert("🚨 Erro: Saldo Insuficiente!");
    }
});

function atualizarVisor() {
    const visor = document.querySelector("#visorQtd");
    visor.textContent = estoqueAtual;
    document.querySelector("#valorMovimentacao").value = "";

    // Feedback Visual de cor (Aula 3)
    if (estoqueAtual < 10) { visor.style.color = "red"; } 
    else { visor.style.color = "#2c3e50"; }
}