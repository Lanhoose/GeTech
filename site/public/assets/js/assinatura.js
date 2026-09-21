// ============================================================================
// ASSINATURA.JS
// ============================================================================

import { auth, db }
    from '../../../Site C/assets/js/firebase-config.js';

import {
    onAuthStateChanged
}
    from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

import {
    ref,
    get,
    update,
    onValue
}
    from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

import {
    registrarAuditoria
}
    from '../../../app/assets/js/auditoria.js';


// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const CHAVE_CHECKOUT =
    'getech:checkout';

const VALIDADE_CHECKOUT_MS =
    30 * 60 * 1000;

const PAGINA_PLANOS =
    'planos.html';

const PAGINA_APOS_ASSINAR =
    'index.html';


// ============================================================================
// PLANOS
// ============================================================================

const PLANOS = {

    'Essencial': {

        preco: 499,

        beneficios: [

            'Acesso à manutenção Corretiva Agendada',

            'Relatórios Mensais consolidados em PDF',

            'Suporte técnico ágil em até 24h',

            'Gestão monitorada de até 5 Máquinas simultâneas',

            'Acesso básico ao painel de controle'

        ]

    },


    'Pro Performance': {

        preco: 1299,

        beneficios: [

            'Tecnologia de Manutenção Preditiva com sensores IoT',

            'Dashboard industrial atualizado em Tempo Real',

            'Suporte Prioritário Emergencial com SLA de 4h',

            'Gestão expandida para até 20 Máquinas',

            'Análise gráfica de Vibração e Temperatura inclusa',

            'Estatísticas de OEE integradas'

        ]

    },


    'Enterprise': {

        preco: null,

        beneficios: [

            'Gestão de Parque Industrial Ilimitado',

            'Consultoria Técnica e de Engenharia Dedicada',

            'Integração total via API RESTful (SAP, TOTVS, etc)',

            'Treinamento operacional de Equipe In-loco',

            'Customização completa de alertas e relatórios de métricas',

            'Acordo de Nível de Serviço (SLA) Personalizado'

        ]

    }

};


// ============================================================================
// PAGAMENTOS
// ============================================================================

const PAINEIS_PAGAMENTO = {

    card:
        'paymentCardContent',

    pix:
        'paymentPixContent',

    boleto:
        'paymentBoletoContent'

};


const CAMPOS_CARTAO = [

    'cardNumber',

    'cardName',

    'cardExpiry',

    'cardCvc'

];


let precoSobConsulta = null;

let cancelEscutaSolicitacao = null;

let metodoAtual = 'card';


// ============================================================================
// UTILITÁRIOS
// ============================================================================

const $ =
    (id) =>
        document.getElementById(id);


const valor =
    (id) =>
        ($(id)?.value || '').trim();


const soDigitos =
    (texto) =>
        String(texto || '')
            .replace(/\D/g, '');


function temPlano(nome) {

    return Object.prototype.hasOwnProperty.call(
        PLANOS,
        nome
    );

}


function formatarPrecoCurto(preco) {

    return 'R$ ' +
        Number(preco).toLocaleString(
            'pt-BR'
        );

}


function formatarPrecoCompleto(preco) {

    return 'R$ ' +
        Number(preco).toLocaleString(
            'pt-BR',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// ============================================================================
// TRAVA DE ACESSO
// ============================================================================

function lerCheckoutAutorizado() {

    try {

        const bruto =
            sessionStorage.getItem(
                CHAVE_CHECKOUT
            );


        if (!bruto) {

            return null;

        }


        const dados =
            JSON.parse(bruto);


        if (
            !dados ||
            !temPlano(dados.plano)
        ) {

            return null;

        }


        const idade =
            Date.now() -
            Number(dados.criadoEm);


        if (
            !Number.isFinite(idade) ||
            idade < 0 ||
            idade > VALIDADE_CHECKOUT_MS
        ) {

            return null;

        }


        return dados;


    } catch {

        return null;

    }

}


function limparCheckout() {

    try {

        sessionStorage.removeItem(
            CHAVE_CHECKOUT
        );

    } catch {

        // Nada a fazer.

    }

}


function voltarParaPlanos() {

    window.location.replace(
        PAGINA_PLANOS
    );

}


// ============================================================================
// ESTADO DO PREÇO SOB CONSULTA
// ============================================================================

function atualizarEstadoSobConsulta(preco) {

    const liberado =
        Number.isFinite(
            Number(preco)
        ) &&
        Number(preco) > 0;


    const valorFinal =
        liberado
            ? Number(preco)
            : null;


    precoSobConsulta =
        valorFinal;


    const precoGrande =
        $('checkoutPlanPrice');


    const total =
        $('checkoutTotalPrice');


    const aviso =
        $('consultaPrecoAviso');


    const formularioPagamento =
        $('paymentSection');


    const botao =
        $('submitSubscriptionBtn');


    // ------------------------------------------------------------------------
    // PREÇO GRANDE
    // ------------------------------------------------------------------------

    if (precoGrande) {

        precoGrande.textContent =
            '';


        if (valorFinal === null) {

            precoGrande.textContent =
                'Preço sob consulta';


        } else {

            precoGrande.textContent =
                formatarPrecoCurto(
                    valorFinal
                );


            const sufixo =
                document.createElement(
                    'span'
                );


            sufixo.textContent =
                '/mês';


            precoGrande.appendChild(
                sufixo
            );

        }

    }


    // ------------------------------------------------------------------------
    // TOTAL
    // ------------------------------------------------------------------------

    if (total) {

        total.textContent =
            valorFinal === null

                ? 'Preço sob consulta'

                : formatarPrecoCompleto(
                    valorFinal
                );

    }


    // ------------------------------------------------------------------------
    // AVISO
    // ------------------------------------------------------------------------

    if (aviso) {

        aviso.style.display =
            valorFinal === null
                ? 'block'
                : 'none';


        aviso.textContent =

            valorFinal === null

                ? 'Preço sob consulta. Aguarde o gestor definir o valor para liberar o pagamento.'

                : `Preço definido pelo gestor: ${formatarPrecoCompleto(valorFinal)} por mês.`;

    }


    // ------------------------------------------------------------------------
    // BLOQUEIO DE PAGAMENTO
    // ------------------------------------------------------------------------

    if (formularioPagamento) {

        formularioPagamento.classList.toggle(
            'payment-locked',
            valorFinal === null
        );

    }


    // ------------------------------------------------------------------------
    // BOTÃO
    // ------------------------------------------------------------------------

    if (botao) {

        botao.disabled =
            valorFinal === null;


        botao.textContent =

            valorFinal === null

                ? 'Aguardando preço do gestor'

                : 'Confirmar e Ativar Assinatura';

    }


    // ------------------------------------------------------------------------
    // CARTÃO
    // ------------------------------------------------------------------------

    CAMPOS_CARTAO.forEach(
        (id) => {

            const campo =
                $(id);


            if (campo) {

                campo.disabled =
                    valorFinal === null;

            }

        }
    );


    // ------------------------------------------------------------------------
    // ABAS
    // ------------------------------------------------------------------------

    document
        .querySelectorAll('.tab-btn')
        .forEach(
            (aba) => {

                aba.disabled =
                    valorFinal === null;

            }
        );

}


// ============================================================================
// CARREGAR PREÇO DO FIREBASE
// ============================================================================

async function carregarPrecoSobConsulta(
    usuario,
    nomePlano
) {

    if (
        nomePlano !== 'Enterprise'
    ) {

        return;

    }


    const solicitacaoRef =
        ref(
            db,
            `solicitacoesPlanos/${usuario.uid}`
        );


    // ------------------------------------------------------------------------
    // PRIMEIRA LEITURA
    // ------------------------------------------------------------------------

    try {

        const snap =
            await get(
                solicitacaoRef
            );


        const dados =
            snap.exists()
                ? snap.val()
                : null;


        atualizarEstadoSobConsulta(
            dados?.preco
        );


    } catch (erro) {

        console.error(
            'Erro ao consultar preço personalizado:',
            erro
        );


        atualizarEstadoSobConsulta(
            null
        );

    }


    // ------------------------------------------------------------------------
    // ESCUTA EM TEMPO REAL
    // ------------------------------------------------------------------------

    if (cancelEscutaSolicitacao) {

        cancelEscutaSolicitacao();

    }


    cancelEscutaSolicitacao =
        onValue(
            solicitacaoRef,
            (snap) => {

                const dados =
                    snap.exists()
                        ? snap.val()
                        : null;


                atualizarEstadoSobConsulta(
                    dados?.preco
                );

            }
        );

}


// ============================================================================
// PREENCHER RESUMO
// ============================================================================

function preencherResumo(nomePlano) {

    const plano =
        PLANOS[nomePlano];


    if (!plano) {

        voltarParaPlanos();

        return;

    }


    const titulo =
        $('checkoutPlanTitle');


    if (titulo) {

        titulo.textContent =
            nomePlano;

    }


    const precoGrande =
        $('checkoutPlanPrice');


    if (precoGrande) {

        precoGrande.textContent =
            '';


        if (plano.preco === null) {

            precoGrande.textContent =
                'Preço sob consulta';


        } else {

            precoGrande.append(
                formatarPrecoCurto(
                    plano.preco
                )
            );


            const sufixo =
                document.createElement(
                    'span'
                );


            sufixo.textContent =
                '/mês';


            precoGrande.appendChild(
                sufixo
            );

        }

    }


    const total =
        $('checkoutTotalPrice');


    if (total) {

        total.textContent =

            plano.preco === null

                ? 'Preço sob consulta'

                : formatarPrecoCompleto(
                    plano.preco
                );

    }


    const lista =
        $('checkoutBenefitsList');


    if (lista) {

        lista.innerHTML =
            '';


        plano.beneficios.forEach(
            (beneficio) => {

                const li =
                    document.createElement(
                        'li'
                    );


                li.textContent =
                    beneficio;


                lista.appendChild(
                    li
                );

            }
        );

    }


    document.title =
        `Assinatura ${nomePlano} - GeTech ERP`;

}


// ============================================================================
// MÁSCARAS
// ============================================================================

function mascaraDocumento(texto) {

    const d =
        soDigitos(texto)
            .slice(0, 14);


    if (d.length <= 11) {

        let r =
            d.slice(0, 3);


        if (d.length > 3) {

            r +=
                '.' +
                d.slice(3, 6);

        }


        if (d.length > 6) {

            r +=
                '.' +
                d.slice(6, 9);

        }


        if (d.length > 9) {

            r +=
                '-' +
                d.slice(9, 11);

        }


        return r;

    }


    let r =
        `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}`;


    if (d.length > 12) {

        r +=
            '-' +
            d.slice(12, 14);

    }


    return r;

}


function mascaraTelefone(texto) {

    const d =
        soDigitos(texto)
            .slice(0, 11);


    if (!d) {

        return '';

    }


    if (d.length < 3) {

        return `(${d}`;

    }


    const corte =
        d.length > 10
            ? 7
            : 6;


    let r =
        `(${d.slice(0, 2)}) ${d.slice(2, corte)}`;


    if (d.length > corte) {

        r +=
            '-' +
            d.slice(corte);

    }


    return r;

}


function mascaraCep(texto) {

    const d =
        soDigitos(texto)
            .slice(0, 8);


    return d.length > 5

        ? `${d.slice(0, 5)}-${d.slice(5)}`

        : d;

}


function mascaraCartao(texto) {

    return soDigitos(texto)
        .slice(0, 16)
        .replace(
            /(\d{4})(?=\d)/g,
            '$1 '
        );

}


function mascaraValidade(texto) {

    const d =
        soDigitos(texto)
            .slice(0, 4);


    return d.length > 2

        ? `${d.slice(0, 2)}/${d.slice(2)}`

        : d;

}


function mascaraCvc(texto) {

    return soDigitos(texto)
        .slice(0, 4);

}


function aplicarMascara(
    idCampo,
    funcaoMascara
) {

    const campo =
        $(idCampo);


    if (!campo) {

        return;

    }


    campo.addEventListener(
        'input',
        () => {

            campo.value =
                funcaoMascara(
                    campo.value
                );

        }
    );

}


// ============================================================================
// BUSCA DE CEP (VIACEP)
// ============================================================================

const URL_VIACEP =
    'https://viacep.com.br/ws';

const TEMPO_LIMITE_CEP_MS =
    8000;

let ultimoCepConsultado =
    '';

let controladorCep =
    null;


function mostrarStatusCep(
    mensagem,
    tipo = ''
) {

    const status =
        $('cepStatus');


    if (!status) {

        return;

    }


    status.textContent =
        mensagem;


    status.className =
        tipo
            ? `cep-status ${tipo}`
            : 'cep-status';

}


function preencherCampoEndereco(
    idCampo,
    texto
) {

    const campo =
        $(idCampo);


    if (!campo) {

        return;

    }


    campo.value =
        texto || '';

}


async function buscarCep(cep) {

    if (controladorCep) {

        controladorCep.abort();

    }


    const controlador =
        new AbortController();


    controladorCep =
        controlador;


    const temporizador =
        setTimeout(
            () => controlador.abort(),
            TEMPO_LIMITE_CEP_MS
        );


    mostrarStatusCep(
        'Buscando endereço...',
        'loading'
    );


    try {

        const resposta =
            await fetch(
                `${URL_VIACEP}/${cep}/json/`,
                {
                    signal:
                        controlador.signal
                }
            );


        if (!resposta.ok) {

            throw new Error(
                `ViaCEP respondeu ${resposta.status}`
            );

        }


        const dados =
            await resposta.json();


        // O usuário mudou o CEP enquanto a busca acontecia.
        if (
            controlador !== controladorCep
        ) {

            return;

        }


        if (dados.erro) {

            mostrarStatusCep(
                'CEP não encontrado. Preencha o endereço manualmente.',
                'error'
            );

            return;

        }


        preencherCampoEndereco(
            'street',
            dados.logradouro
        );

        preencherCampoEndereco(
            'neighborhood',
            dados.bairro
        );

        preencherCampoEndereco(
            'city',
            dados.localidade
        );

        preencherCampoEndereco(
            'state',
            dados.uf
        );


        mostrarStatusCep(
            'Endereço encontrado. Confira e informe o número.',
            'success'
        );


        // CEP geral de cidade não traz rua: leva o foco para ela.
        $(
            valor('street')
                ? 'number'
                : 'street'
        )?.focus();


    } catch (erro) {

        // Busca substituída por outra (ou CEP apagado): não mostra nada.
        if (
            controlador !== controladorCep
        ) {

            return;

        }


        // Permite tentar de novo com o mesmo CEP.
        ultimoCepConsultado =
            '';


        mostrarStatusCep(
            erro.name === 'AbortError'
                ? 'A consulta demorou demais. Preencha o endereço manualmente.'
                : 'Não foi possível consultar o CEP. Preencha o endereço manualmente.',
            'error'
        );


        console.error(
            'Erro ao consultar o ViaCEP:',
            erro
        );


    } finally {

        clearTimeout(
            temporizador
        );


        if (
            controlador === controladorCep
        ) {

            controladorCep =
                null;

        }

    }

}


function configurarBuscaCep() {

    const campoCep =
        $('zipCode');


    if (!campoCep) {

        return;

    }


    campoCep.addEventListener(
        'input',
        () => {

            const cep =
                soDigitos(
                    campoCep.value
                ).slice(0, 8);


            // CEP incompleto: cancela busca em andamento e limpa o aviso.
            if (cep.length < 8) {

                if (controladorCep) {

                    controladorCep.abort();

                    controladorCep =
                        null;

                }


                ultimoCepConsultado =
                    '';


                mostrarStatusCep(
                    ''
                );


                return;

            }


            if (
                cep === ultimoCepConsultado
            ) {

                return;

            }


            ultimoCepConsultado =
                cep;


            buscarCep(
                cep
            );

        }
    );

}


// ============================================================================
// FORMA DE PAGAMENTO
// ============================================================================

function selecionarMetodo(metodo) {

    if (
        !Object.prototype.hasOwnProperty.call(
            PAINEIS_PAGAMENTO,
            metodo
        )
    ) {

        return;

    }


    metodoAtual =
        metodo;


    document
        .querySelectorAll('.tab-btn')
        .forEach(
            (aba) => {

                aba.classList.toggle(
                    'active',
                    aba.dataset.method === metodo
                );

            }
        );


    Object.entries(
        PAINEIS_PAGAMENTO
    ).forEach(
        ([chave, idPainel]) => {

            $(idPainel)
                ?.classList
                .toggle(
                    'active',
                    chave === metodo
                );

        }
    );


    CAMPOS_CARTAO.forEach(
        (id) => {

            const campo =
                $(id);


            if (campo) {

                campo.required =
                    metodo === 'card';

            }

        }
    );

}


// ============================================================================
// VALIDAÇÃO
// ============================================================================

function validarFormulario() {

    if (
        PLANOS[
            checkoutAutorizado?.plano
        ]?.preco === null
        &&
        precoSobConsulta === null
    ) {

        return (
            'O pagamento está bloqueado enquanto o gestor não definir o preço do plano.'
        );

    }


    const documento =
        soDigitos(
            valor('docNumber')
        );


    if (
        documento.length !== 11 &&
        documento.length !== 14
    ) {

        return (
            'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.'
        );

    }


    if (
        soDigitos(
            valor('phone')
        ).length < 10
    ) {

        return (
            'Informe um telefone válido com DDD.'
        );

    }


    if (
        soDigitos(
            valor('zipCode')
        ).length !== 8
    ) {

        return (
            'Informe um CEP válido com 8 dígitos.'
        );

    }


    // ------------------------------------------------------------------------
    // CARTÃO
    // ------------------------------------------------------------------------

    if (
        metodoAtual === 'card'
    ) {

        const numero =
            soDigitos(
                valor('cardNumber')
            );


        if (
            numero.length < 13 ||
            numero.length > 16
        ) {

            return (
                'Informe um número de cartão válido.'
            );

        }


        const validade =
            valor('cardExpiry');


        if (
            !/^(0[1-9]|1[0-2])\/\d{2}$/
                .test(validade)
        ) {

            return (
                'Informe a validade do cartão no formato MM/AA.'
            );

        }


        const [mes, ano] =
            validade
                .split('/')
                .map(Number);


        const fimDaValidade =
            new Date(
                2000 + ano,
                mes,
                1
            );


        if (
            fimDaValidade <= new Date()
        ) {

            return (
                'O cartão informado está vencido.'
            );

        }


        const cvc =
            soDigitos(
                valor('cardCvc')
            );


        if (
            cvc.length < 3 ||
            cvc.length > 4
        ) {

            return (
                'Informe o código de segurança (CVC) do cartão.'
            );

        }

    }


    return null;

}


// ============================================================================
// STATUS
// ============================================================================

function definirStatus(
    plano,
    metodo
) {

    if (
        plano.preco === null &&
        precoSobConsulta === null
    ) {

        return 'aguardando_preco';

    }


    return metodo === 'card'
        ? 'ativa'
        : 'aguardando_pagamento';

}


// ============================================================================
// MENSAGEM
// ============================================================================

function montarMensagemSucesso(
    nomePlano,
    plano,
    metodo
) {

    const preco =
        plano.preco === null
            ? precoSobConsulta
            : plano.preco;


    if (preco === null) {

        return (
            `Solicitação do plano ${nomePlano} registrada! Aguarde o gestor definir o preço.`
        );

    }


    if (metodo === 'pix') {

        return (
            `Assinatura do plano ${nomePlano} registrada por ${formatarPrecoCompleto(preco)}/mês! Conclua o pagamento via PIX para liberar o acesso.`
        );

    }


    if (metodo === 'boleto') {

        return (
            `Assinatura do plano ${nomePlano} registrada por ${formatarPrecoCompleto(preco)}/mês! O acesso é liberado após a compensação do boleto.`
        );

    }


    return (
        `Assinatura do plano ${nomePlano} ativada por ${formatarPrecoCompleto(preco)}/mês com sucesso!`
    );

}


// ============================================================================
// FINALIZAR ASSINATURA
// ============================================================================

async function finalizarAssinatura(
    checkout,
    botao
) {

    const usuario =
        auth.currentUser;


    if (!usuario) {

        alert(
            'Sua sessão expirou. Faça login novamente para concluir a assinatura.'
        );


        window.location.href =
            'login.html';


        return;

    }


    const nomePlano =
        checkout.plano;


    const plano =
        PLANOS[nomePlano];


    if (!plano) {

        alert(
            'Plano inválido.'
        );

        return;

    }


    let precoFinal =
        plano.preco === null

            ? precoSobConsulta

            : plano.preco;


    // ------------------------------------------------------------------------
    // RECONFIRMA O PREÇO DIRETO NO FIREBASE (Enterprise)
    //
    // O preço do Enterprise é definido pelo gestor em "solicitacoesPlanos".
    // Nunca confiamos apenas no valor já carregado em memória: buscamos o
    // valor mais recente agora, na hora de confirmar, para evitar enviar
    // um preço desatualizado (ou adulterado) para o servidor. As Rules do
    // Firebase também bloqueiam qualquer tentativa de gravar um valor
    // diferente do definido pelo gestor.
    // ------------------------------------------------------------------------

    if (
        plano.preco === null
    ) {

        try {

            const snapAtual =
                await get(
                    ref(
                        db,
                        `solicitacoesPlanos/${usuario.uid}`
                    )
                );

            const precoAtual =
                snapAtual.exists()
                    ? Number(
                        snapAtual.val()?.preco
                    )
                    : null;

            precoFinal =
                Number.isFinite(precoAtual) && precoAtual > 0
                    ? precoAtual
                    : null;

            atualizarEstadoSobConsulta(
                precoFinal
            );

        } catch (erroPreco) {

            console.error(
                'Erro ao reconfirmar o preço do Enterprise:',
                erroPreco
            );

            precoFinal = null;

        }

    }


    // ------------------------------------------------------------------------
    // TRAVA DEFINITIVA DO PAGAMENTO
    // ------------------------------------------------------------------------

    if (
        precoFinal === null ||
        !Number.isFinite(Number(precoFinal)) ||
        Number(precoFinal) <= 0
    ) {

        alert(
            'Aguarde o gestor definir o preço antes de efetuar o pagamento.'
        );


        atualizarEstadoSobConsulta(
            null
        );


        return;

    }


    const agora =
        Date.now();


    const assinatura = {

        plano:
            nomePlano,

        recorrencia:
            valor('installments') === '12'
                ? 'anual_12x'
                : 'mensal',

        metodoPagamento:
            metodoAtual,

        status:
            definirStatus(
                plano,
                metodoAtual
            ),

        criadaEm:
            agora,

        valorMensal:
            Number(precoFinal),

        dadosFaturamento: {

            nome:
                valor('fullName'),

            documento:
                soDigitos(
                    valor('docNumber')
                ),

            email:
                valor('email'),

            telefone:
                soDigitos(
                    valor('phone')
                ),

            cep:
                soDigitos(
                    valor('zipCode')
                ),

            logradouro:
                valor('street'),

            numero:
                valor('number'),

            complemento:
                valor('complement'),

            bairro:
                valor('neighborhood'),

            cidade:
                valor('city'),

            uf:
                valor('state')

        }

    };


    // Nunca salvar número completo do cartão ou CVC.

    if (
        metodoAtual === 'card'
    ) {

        assinatura.cartaoFinal =
            soDigitos(
                valor('cardNumber')
            ).slice(-4);

    }


    const textoOriginal =
        botao.textContent;


    botao.disabled =
        true;


    botao.textContent =
        'Processando...';


    try {

        await update(

            ref(
                db,
                `usuarios/${usuario.uid}`
            ),

            {

                planoAdquirido:
                    nomePlano,

                planoAtualizadoEm:
                    agora,

                assinatura:
                    assinatura

            }

        );


        await registrarAuditoria(

            'Assinatura: plano contratado',

            `Plano ${nomePlano} contratado via ${metodoAtual} (status: ${assinatura.status}).`,

            'info'

        );


        limparCheckout();


        alert(
            montarMensagemSucesso(
                nomePlano,
                plano,
                metodoAtual
            )
        );


        window.location.href =
            PAGINA_APOS_ASSINAR;


    } catch (erro) {

        console.error(
            'Erro ao salvar assinatura:',
            erro
        );


        alert(
            'Não foi possível concluir a assinatura. Tente novamente em instantes.'
        );


        botao.disabled =
            false;


        botao.textContent =
            textoOriginal;

    }

}


// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

function iniciar(checkout) {

    preencherResumo(
        checkout.plano
    );


    // Enterprise começa bloqueado.
    // O Firebase depois poderá liberar o pagamento.
    if (
        checkout.plano ===
        'Enterprise'
    ) {

        atualizarEstadoSobConsulta(
            null
        );

    }


    // ------------------------------------------------------------------------
    // MÁSCARAS
    // ------------------------------------------------------------------------

    aplicarMascara(
        'docNumber',
        mascaraDocumento
    );


    aplicarMascara(
        'phone',
        mascaraTelefone
    );


    aplicarMascara(
        'zipCode',
        mascaraCep
    );


    configurarBuscaCep();


    aplicarMascara(
        'cardNumber',
        mascaraCartao
    );


    aplicarMascara(
        'cardExpiry',
        mascaraValidade
    );


    aplicarMascara(
        'cardCvc',
        mascaraCvc
    );


    // ------------------------------------------------------------------------
    // ABAS
    // ------------------------------------------------------------------------

    document
        .querySelectorAll('.tab-btn')
        .forEach(
            (aba) => {

                aba.addEventListener(
                    'click',
                    () => {

                        selecionarMetodo(
                            aba.dataset.method
                        );

                    }
                );

            }
        );


    selecionarMetodo(
        'card'
    );


    // ------------------------------------------------------------------------
    // VOLTAR
    // ------------------------------------------------------------------------

    document
        .querySelector('.back-link')
        ?.addEventListener(
            'click',
            limparCheckout
        );


    // ------------------------------------------------------------------------
    // FORMULÁRIO
    // ------------------------------------------------------------------------

    const formulario =
        $('subscriptionForm');


    const botaoEnviar =
        $('submitSubscriptionBtn');


    let enviando =
        false;


    formulario?.addEventListener(

        'submit',

        async (evento) => {

            evento.preventDefault();


            if (enviando) {

                return;

            }


            // --------------------------------------------------------------
            // REVALIDA CHECKOUT
            // --------------------------------------------------------------

            if (
                !lerCheckoutAutorizado()
            ) {

                alert(
                    'Sua sessão de assinatura expirou. Escolha o plano novamente.'
                );


                voltarParaPlanos();


                return;

            }


            // --------------------------------------------------------------
            // VALIDA PREÇO
            // --------------------------------------------------------------

            if (
                checkout.plano ===
                'Enterprise' &&
                precoSobConsulta === null
            ) {

                alert(
                    'O preço ainda não foi definido pelo gestor. Aguarde o valor ser informado.'
                );


                return;

            }


            // --------------------------------------------------------------
            // VALIDA FORMULÁRIO
            // --------------------------------------------------------------

            const erro =
                validarFormulario();


            if (erro) {

                alert(
                    erro
                );


                return;

            }


            enviando =
                true;


            try {

                await finalizarAssinatura(
                    checkout,
                    botaoEnviar
                );


            } finally {

                enviando =
                    false;

            }

        }

    );

}


// ============================================================================
// INICIAR
// ============================================================================

const checkoutAutorizado =
    lerCheckoutAutorizado();


if (!checkoutAutorizado) {

    voltarParaPlanos();


} else {

    iniciar(
        checkoutAutorizado
    );


    onAuthStateChanged(
        auth,
        (user) => {

            if (!user) {

                return;

            }


            if (
                checkoutAutorizado.plano ===
                'Enterprise'
            ) {

                carregarPrecoSobConsulta(

                    user,

                    checkoutAutorizado.plano

                );

            }

        }
    );

}


// ============================================================================
// CACHE DO NAVEGADOR
// ============================================================================

window.addEventListener(
    'pageshow',
    (evento) => {

        if (
            evento.persisted &&
            !lerCheckoutAutorizado()
        ) {

            voltarParaPlanos();

        }

    }
);