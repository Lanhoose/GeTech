document.addEventListener("DOMContentLoaded", () => {
     const sessao = JSON.parse(localStorage.getItem('sessaoGeTech'));
    const BASE_URL = window.location.origin + "/GeTech";

    // Se não houver sessão, se não estiver ativo, ou se o perfil NÃO for gestor
    if (!sessao || !sessao.loginAtivo || sessao.perfil !== 'gestor') {
        alert("Acesso restrito. Apenas gestores podem acessar este painel.");
        // Redireciona para a página de login
        window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
        return; // Para a execução do resto do script
    }
});

const tabela = document.getElementById("tabela-ordens");

let ordens = JSON.parse(localStorage.getItem("ordensERP")) || [];

/* =========================
TROCA DE TELAS
========================= */

function trocarTela(tela, botao){

    document.getElementById("tela-cadastro").style.display = "none";
    document.getElementById("tela-rastreio").style.display = "none";
    document.getElementById("tela-frete").style.display = "none";

    document.querySelectorAll(".nav-btn").forEach(btn=>{
        btn.classList.remove("ativo");
    });

    if(botao){
        botao.classList.add("ativo");
    }

    if(tela === "cadastro"){
        document.getElementById("tela-cadastro").style.display = "block";
    }

    if(tela === "rastreio"){
        document.getElementById("tela-rastreio").style.display = "block";
    }

    if(tela === "frete"){
        document.getElementById("tela-frete").style.display = "block";
    }

}

/* =========================
SALVAR ORDEM
========================= */

function salvarOrdem(){

    const cliente = document.getElementById("cliente").value;
    const produto = document.getElementById("produto").value;
    const quantidade = document.getElementById("quantidade").value;
    const responsavel = document.getElementById("responsavel").value;
    const cidade = document.getElementById("cidade").value;
    const status = document.getElementById("status").value;
    const prioridade = document.getElementById("prioridade").value;
    const prazo = document.getElementById("prazo").value;

    if(!cliente || !produto){
        alert("Preencha os campos.");
        return;
    }

    const ordem = {
        cliente,
        produto,
        quantidade,
        responsavel,
        cidade,
        status,
        prioridade,
        prazo
    };

    ordens.push(ordem);

    localStorage.setItem("ordensERP", JSON.stringify(ordens));

    renderizarTabela();

    limparCampos();
}

/* =========================
RENDER TABELA
========================= */

function renderizarTabela(){

    tabela.innerHTML = "";

    ordens.forEach((ordem, index)=>{

        tabela.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${ordem.cliente}</td>
                <td>${ordem.produto}</td>
                <td>${ordem.quantidade}</td>
                <td>${ordem.responsavel}</td>
                <td>${ordem.cidade}</td>
                <td>${ordem.status}</td>
                <td>${ordem.prioridade}</td>
                <td>${ordem.prazo}</td>
            </tr>
        `;

    });

}

/* =========================
LIMPAR
========================= */

function limparCampos(){

    document.getElementById("cliente").value = "";
    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("responsavel").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("prazo").value = "";

}

/* =========================
EXCLUIR
========================= */

function excluirOrdem(){

    const numero = prompt("Digite o número da ordem:");

    if(numero === null) return;

    ordens.splice(numero - 1, 1);

    localStorage.setItem("ordensERP", JSON.stringify(ordens));

    renderizarTabela();
}

/* =========================
PDF
========================= */

function baixarPDF(){

    window.print();

}

/* =========================
EXCEL
========================= */

function baixarExcel(){

    let conteudo = "Cliente,Produto,Quantidade\n";

    ordens.forEach(ordem=>{

        conteudo += `${ordem.cliente},${ordem.produto},${ordem.quantidade}\n`;

    });

    const blob = new Blob([conteudo], {
        type:"text/csv"
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "ordens.csv";

    link.click();

}

/* =========================
RASTREIO
========================= */

function rastrearPedido(){

    const codigo = document.getElementById("codigo-rastreio").value.toLowerCase();

    const resultado = document.getElementById("resultado-rastreio");

    const ordem = ordens.find(o =>
        o.cliente.toLowerCase().includes(codigo)
    );

    if(ordem){

        resultado.innerHTML = `
            <div class="form-card">

                <h3>Pedido encontrado</h3>

                <p><strong>Cliente:</strong> ${ordem.cliente}</p>
                <p><strong>Produto:</strong> ${ordem.produto}</p>
                <p><strong>Status:</strong> ${ordem.status}</p>
                <p><strong>Prioridade:</strong> ${ordem.prioridade}</p>

            </div>
        `;

    } else {

        resultado.innerHTML = `
            <div class="form-card">
                Pedido não encontrado.
            </div>
        `;

    }

}

/* =========================
CALCULO DE FRETE
========================= */

function calcularFrete(){

    const peso = Number(document.getElementById("peso").value);

    const distancia = Number(document.getElementById("distancia").value);

    const tipo = Number(document.getElementById("tipo-entrega").value);

    if(!peso || !distancia){
        alert("Preencha os dados.");
        return;
    }

    const valor = ((peso * 0.45) + (distancia * 0.12)) * tipo;

    document.getElementById("resultado-frete").innerHTML =
        `R$ ${valor.toFixed(2)}`;

}

/* =========================
LOGOUT
========================= */

function logout(){

    window.location.href = "../pages/login.html";

}

/* =========================
INICIAR
========================= */

renderizarTabela();