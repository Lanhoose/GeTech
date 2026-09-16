const listaTemas = [
    {
        id: "agricolas",
        titulo: "Máquinas Agrícolas",
        descricao: "Teste seus conhecimentos sobre tratores, colheitadeiras, manutenção e operação no campo."
    },
    {
        id: "prensas",
        titulo: "Prensas Hidráulicas",
        descricao: "Perguntas sobre o princípio de Pascal, segurança bimanual e manutenção hidráulica."
    },
    {
        id: "solda",
        titulo: "Máquinas de Solda Transformadora",
        descricao: "Teste seu domínio sobre transformadores, eletrodos revestidos e equipamentos de proteção."
    },
    {
        id: "quinadoras",
        titulo: "Quinadoras (Prensas Dobradeiras)",
        descricao: "Questões técnicas sobre punção, matriz, retorno elástico e dobra de chapas metálicas."
    }
];

const perguntasQuiz = {
    agricolas: [
        { p: "1. Qual o principal componente de tração em um trator agrícola?", o: ["Tomada de Potência", "Rodado/Esteira", "Barra de Tração", "Sistema Hidráulico"], a: 1 },
        { p: "2. O sistema TDP (Tomada de Potência) serve para:", o: ["Mudar as marchas", "Transferir força mecânica para implementos", "Frear o trator", "Controlar a direção"], a: 1 },
        { p: "3. Qual é a principal função de uma colheitadeira?", o: ["Arar o solo", "Corte, trilha, separação e limpeza dos grãos", "Adubar a terra", "Pulverizar defensivos"], a: 1 },
        { p: "4. Qual sistema evita a compactação excessiva do solo pelas máquinas?", o: ["Pneus adequados e pressão correta", "Aumento da velocidade", "Uso contínuo de freio", "Faróis acesos"], a: 0 },
        { p: "5. A manutenção preventiva de óleo e filtros deve ser feita:", o: ["Apenas quando quebrar", "Conforme as horas de trabalho indicadas pelo fabricante", "Uma vez a cada 5 anos", "Nunca"], a: 1 },
        { p: "6. O sistema hidráulico de três pontos serve para:", o: ["Acoplar e levantar implementos", "Abastecer combustível", "Ligar o motor", "Refrigerar a cabine"], a: 0 },
        { p: "7. O arado de discos é utilizado para:", o: ["Colher milho", "Corte e inversão da camada superficial do solo", "Pulverizar água", "Empacotar palha"], a: 1 },
        { p: "8. Pulverizadores agrícolas são utilizados principalmente para:", o: ["Nivelar o solo", "Aplicar defensivos e fertilizantes líquidos", "Plantando sementes", "Transportar grãos"], a: 1 },
        { p: "9. O que significa EPI no uso de máquinas e aplicação de insumos?", o: ["Equipamento de Proteção Individual", "Estrutura Para Injeção", "Elemento de Pressão Interna", "Engrenagem Principal Industrial"], a: 0 },
        { p: "10. Qual a função da semeadora?", o: ["Cortar mato", "Depositar sementes no solo na profundidade adequada", "Limpar o motor", "Secar o grão"], a: 1 }
    ],
    prensas: [
        { p: "1. Qual é o princípio físico fundamental das prensas hidráulicas?", o: ["Lei de Ohm", "Princípio de Pascal", "Lei de Newton", "Efeito Venturi"], a: 1 },
        { p: "2. O fluido mais comum empregado em prensas hidráulicas é:", o: ["Água purificada", "Óleo hidráulico mineral/sintético", "Gasolina", "Ar comprimido"], a: 1 },
        { p: "3. A função da válvula de alívio de pressão é:", o: ["Aumentar a velocidade", "Proteger o sistema contra sobrepressão", "Trocar a cor do óleo", "Desligar o visor"], a: 1 },
        { p: "4. Qual componente converte energia hidráulica em energia mecânica linear?", o: ["Bomba hidráulica", "Cilindro/Pistão hidráulico", "Reservatório", "Manômetro"], a: 1 },
        { p: "5. O manômetro em uma prensa serve para medir:", o: ["A temperatura do ambiente", "A pressão do sistema", "A velocidade do motor", "O volume de óleo"], a: 1 },
        { p: "6. Uma falha comum causada por contaminação do óleo hidráulico é:", o: ["Desgaste precoce de componentes e travamento de válvulas", "Aumento da potência elétrica", "Melhoria do rendimento", "Redução de barulho"], a: 0 },
        { p: "7. Em prensas hidráulicas, o comando bimanual é utilizado para:", o: ["Gastar mais energia", "Garantir a segurança do operador mantendo as mãos ocupadas", "Aumentar o fluxo de óleo", "Facilitar a limpeza"], a: 1 },
        { p: "8. O reservatório de óleo hidráulico também tem como função:", o: ["Gerar eletricidade", "Dissipar calor e decantar impurezas", "Aumentar a pressão interna", "Resfriar o ambiente"], a: 1 },
        { p: "9. Cavitação em bombas hidráulicas causa:", o: ["Maior eficiência", "Ruído, vibração e danos internos nos componentes", "Aumento da pressão máxima", "Redução do consumo elétrico"], a: 1 },
        { p: "10. O vazamento de óleo em alta pressão pode causar:", o: ["Nenhum risco", "Injeção de fluido sob a pele e acidentes graves", "Melhora na lubrificação externa", "Redução de temperatura"], a: 1 }
    ],
    solda: [
        { p: "1. A principal função do transformador na máquina de solda é:", o: ["Converter alta tensão/baixa corrente em baixa tensão/alta corrente", "Gerar ar comprimido", "Aumentar a voltagem para 1000V", "Converter AC para DC sem componentes adicionais"], a: 0 },
        { p: "2. Qual EPI é indispensável para proteção ocular durante a soldagem?", o: ["Óculos escuros comuns", "Máscara de solda com filtro de escurecimento", "Protetor auricular", "Luva de pano"], a: 1 },
        { p: "3. O eletrodo revestido serve para:", o: ["Apenas conduzir corrente", "Conduzir a corrente e fornecer metal de adição e proteção gasosa", "Resfriar a peça", "Limpar o metal base"], a: 1 },
        { p: "4. A abertura do arco elétrico gera:", o: ["Apenas luz invisível", "Intenso calor e radiação ultravioleta/infravermelha", "Apenas fumaça sem calor", "Obrigatoriamente choque elétrico"], a: 1 },
        { p: "5. O ciclo de trabalho de uma máquina de solda indica:", o: ["O tempo de vida útil da máquina", "A porcentagem de tempo que ela pode operar continuamente em 10 min", "A garantia do fabricante", "A velocidade do arame"], a: 1 },
        { p: "6. A escória formada sobre o cordão de solda deve ser:", o: ["Mantida para sempre", "Removida com picadeira e escova de aço após o resfriamento", "Pintada imediatamente", "Lavada com água fria na hora"], a: 1 },
        { p: "7. O que causa os 'respingos' na soldagem?", o: ["Parâmetros de regulagem incorretos ou umidade", "Uso de EPI correto", "Peça muito limpa", "Corrente muito baixa"], a: 0 },
        { p: "8. A garra negativa (terra) deve ser conectada:", o: ["Na tomada", "Na peça a ser soldada ou na bancada metálica", "No capacete do operador", "Em qualquer parte plástica"], a: 1 },
        { p: "9. O sobreaquecimento da máquina de solda geralmente ativa:", o: ["O alarme de incêndio", "O protetor térmico interno", "A ejeção do eletrodo", "O desligamento da rede da cidade"], a: 1 },
        { p: "10. A umidade nos eletrodos revestidos pode causar:", o: ["Soldas mais bonitas", "Porosidade e trincas na solda", "Aumento da corrente", "Menor consumo de energia"], a: 1 }
    ],
    quinadoras: [
        { p: "1. A quinadora (ou prensa dobradeira) é uma máquina utilizada para:", o: ["Corte por laser", "Dobras em chapas metálicas", "Fundição de peças", "Usinagem de roscas"], a: 1 },
        { p: "2. Os dois elementos principais de ferramenta na quinadora são:", o: ["Broca e bucha", "Punção (macho) e Matriz (fêmea)", "Disco e lixa", "Serra e fieira"], a: 1 },
        { p: "3. O que é o raio de dobra em uma quinadora?", o: ["A velocidade de descida", "O raio interno formado na curva da chapa dobrada", "O comprimento total da máquina", "A espessura da mesa"], a: 1 },
        { p: "4. O efeito de 'retorno elástico' (springback) é:", o: ["A máquina voltar à posição inicial", "A tendência da chapa em tentar voltar ao formato plano após a dobra", "O salto da chapa fora da mesa", "A quebra do punção"], a: 1 },
        { p: "5. Para compensar o retorno elástico, deve-se:", o: ["Dobrar um pouco além do ângulo desejado (superdobra)", "Usar óleo na chapa", "Bater com martelo depois", "Aumentar a velocidade do motor"], a: 0 },
        { p: "6. A força necessária para dobrar uma chapa aumenta quando:", o: ["A espessura do material aumenta", "A chapa é mais fina", "A abertura da matriz é maior", "A chapa é de plástico"], a: 0 },
        { p: "7. O encosto traseiro (backgauge) serve para:", o: ["Segurar o operador", "Posicionar a chapa na medida correta antes da dobra", "Proteger contra cavacos", "Ejetar a peça pronta"], a: 1 },
        { p: "8. A proteção por cortina de luz serve para:", o: ["Melhorar a iluminação do local", "Interromper o movimento se algum objeto ou mão invadir a área de risco", "Medir o ângulo da dobra", "Evitar poeira na máquina"], a: 1 },
        { p: "9. O 'Abertura em V' refere-se a:", o: ["O canal da matriz onde a chapa é pressionada", "A posição dos pés da máquina", "O ângulo do painel elétrico", "O tipo de motor hidráulico"], a: 0 },
        { p: "10. Dobragem no ar (air bending) caracteriza-se por:", o: ["A chapa tocar totalmente o fundo da matriz", "A chapa tocar apenas 3 pontos sem encostar no fundo da matriz", "Usar ar comprimido no lugar do punção", "Dobrar tubos de PVC"], a: 1 }
    ]
};

let indiceTema = 0;
let indicePergunta = 0;
let pontuacao = 0;

// Elementos HTML
const quizCarrossel = document.getElementById("quiz-carrossel");
const cardTemaAtivo = document.getElementById("card-tema-ativo");
const tituloCard = document.getElementById("titulo-tema-card");
const descCard = document.getElementById("desc-tema-card");
const btnPrevTema = document.getElementById("btn-prev-tema");
const btnNextTema = document.getElementById("btn-next-tema");
const btnIniciar = document.getElementById("btn-iniciar-quiz");

const containerQuiz = document.getElementById("quiz-container");
const quizResultado = document.getElementById("quiz-resultado");
const elPergunta = document.getElementById("quiz-pergunta");
const elOpcoes = document.getElementById("quiz-opcoes");
const elProgresso = document.getElementById("quiz-progresso");
const btnProxima = document.getElementById("btn-proxima-pergunta");

// Atualiza o texto do card atual
function atualizarCardTema() {
    const tema = listaTemas[indiceTema];
    tituloCard.innerText = tema.titulo;
    descCard.innerText = tema.descricao;
}

// Lógica de transição suave com efeito de deslize
function trocarTemaComEfeito(direcao) {
    const animSaida = direcao === "next" ? "slide-out-left" : "slide-out-right";
    const animEntrada = direcao === "next" ? "slide-in-right" : "slide-in-left";

    cardTemaAtivo.classList.add(animSaida);

    setTimeout(() => {
        if (direcao === "next") {
            indiceTema = (indiceTema + 1) % listaTemas.length;
        } else {
            indiceTema = (indiceTema - 1 + listaTemas.length) % listaTemas.length;
        }

        atualizarCardTema();

        cardTemaAtivo.classList.remove(animSaida);
        cardTemaAtivo.classList.add(animEntrada);

        setTimeout(() => {
            cardTemaAtivo.classList.remove(animEntrada);
        }, 250);
    }, 200);
}

btnPrevTema.addEventListener("click", () => trocarTemaComEfeito("prev"));
btnNextTema.addEventListener("click", () => trocarTemaComEfeito("next"));

// Iniciar e Exibir Pergunta
btnIniciar.addEventListener("click", () => {
    indicePergunta = 0;
    pontuacao = 0;
    quizCarrossel.classList.add("escondido");
    containerQuiz.classList.remove("escondido");
    carregarPergunta();
});

function carregarPergunta() {
    btnProxima.classList.add("escondido");
    elOpcoes.innerHTML = "";
    
    const idTema = listaTemas[indiceTema].id;
    const q = perguntasQuiz[idTema][indicePergunta];
    elProgresso.innerText = `Pergunta ${indicePergunta + 1} de 10`;
    elPergunta.innerText = q.p;

    q.o.forEach((opcao, i) => {
        const btn = document.createElement("button");
        btn.classList.add("opcao-btn");
        btn.innerText = opcao;
        btn.onclick = () => verificarResposta(i, q.a);
        elOpcoes.appendChild(btn);
    });
}

function verificarResposta(selecionada, correta) {
    const botoes = elOpcoes.querySelectorAll(".opcao-btn");
    botoes.forEach((btn, i) => {
        btn.disabled = true;
        if (i === correta) btn.classList.add("correta");
        if (i === selecionada && selecionada !== correta) btn.classList.add("incorreta");
    });

    if (selecionada === correta) pontuacao++;
    
    if (indicePergunta < 9) {
        btnProxima.classList.remove("escondido");
    } else {
        setTimeout(mostrarResultado, 1200);
    }
}

btnProxima.addEventListener("click", () => {
    indicePergunta++;
    carregarPergunta();
});

function mostrarResultado() {
    containerQuiz.classList.add("escondido");
    quizResultado.classList.remove("escondido");
    const pontuacaoEl = document.getElementById("quiz-pontuacao");
    if (pontuacaoEl) pontuacaoEl.innerText = `Você acertou ${pontuacao} de 10 perguntas no tema ${listaTemas[indiceTema].titulo}!`;
}

// Botões de retorno
document.getElementById("btn-voltar-temas")?.addEventListener("click", voltarParaCarrossel);
document.getElementById("btn-mudar-tema-resultado")?.addEventListener("click", voltarParaCarrossel);

document.getElementById("btn-reiniciar-quiz")?.addEventListener("click", () => {
    quizResultado.classList.add("escondido");
    containerQuiz.classList.remove("escondido");
    indicePergunta = 0;
    pontuacao = 0;
    carregarPergunta();
});

function voltarParaCarrossel() {
    containerQuiz.classList.add("escondido");
    quizResultado.classList.add("escondido");
    quizCarrossel.classList.remove("escondido");
}