// ===========================================================================
// planos.js - GeTech
// Página de planos
// ===========================================================================

import {
    auth,
    db
} from '../../../Site C/assets/js/firebase-config.js';

import {
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

import {
    ref,
    get,
    update,
    set
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

import {
    registrarAuditoria
} from '../../../app/assets/js/auditoria.js';


// ===========================================================================
// CONFIGURAÇÕES
// ===========================================================================

const CHAVE_CHECKOUT =
    'getech:checkout';

const PLANO_SOB_CONSULTA =
    'Enterprise';


// ===========================================================================
// ESTADO
// ===========================================================================

let usuarioAtual = null;

let planoSelecionadoAtual = '';


// ===========================================================================
// INFORMAÇÕES DOS PLANOS
// ===========================================================================

const planosExclusivosInfo = {

    'Essencial': [

        'Acesso à manutenção Corretiva Agendada',

        'Relatórios Mensais consolidados em PDF',

        'Suporte técnico ágil em até 24h',

        'Gestão monitorada de até 5 Máquinas simultâneas',

        'Acesso básico ao painel de controle'

    ],


    'Pro Performance': [

        'Tecnologia de Manutenção Preditiva com sensores IoT',

        'Dashboard industrial atualizado em Tempo Real',

        'Suporte Prioritário Emergencial com SLA de 4h',

        'Gestão expandida para até 20 Máquinas',

        'Análise gráfica de Vibração e Temperatura inclusa',

        'Estatísticas de OEE integradas'

    ],


    'Enterprise': [

        'Gestão de Parque Industrial Ilimitado',

        'Consultoria Técnica e de Engenharia Dedicada',

        'Integração total via API RESTful (SAP, TOTVS, etc)',

        'Treinamento operacional de Equipe In-loco',

        'Customização completa de alertas e relatórios de métricas',

        'Acordo de Nível de Serviço (SLA) Personalizado'

    ]

};


// ===========================================================================
// FORMATAR PREÇO
// ===========================================================================

function formatarPreco(valor) {

    const numero =
        Number(valor);


    if (
        !Number.isFinite(numero) ||
        numero <= 0
    ) {

        return 'Preço sob consulta';

    }


    return numero.toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );

}


// ===========================================================================
// SALVAR CHECKOUT
// ===========================================================================
//
// O Firebase continua sendo a fonte principal do preço.
//
// Este armazenamento serve somente para a página assinatura.html saber
// qual plano foi selecionado durante a navegação.
//
// ===========================================================================

function salvarCheckout(
    uid,
    plano,
    preco = null
) {

    try {

        const dadosCheckout = {

            uid: uid,

            plano: plano,

            criadoEm: Date.now()

        };


        // Se houver preço definido pelo gestor,
        // salva também uma cópia para o checkout.

        const numeroPreco =
            Number(preco);


        if (
            Number.isFinite(numeroPreco) &&
            numeroPreco > 0
        ) {

            dadosCheckout.preco =
                numeroPreco;

        }


        localStorage.setItem(

            CHAVE_CHECKOUT,

            JSON.stringify(
                dadosCheckout
            )

        );


        return true;

    } catch (erro) {

        console.error(
            'Erro ao salvar checkout:',
            erro
        );


        return false;

    }

}


// ===========================================================================
// SELECIONAR PLANO
// ===========================================================================

async function selectPlan(planName) {

    planoSelecionadoAtual =
        planName;


    const modal =
        document.getElementById(
            'planModal'
        );


    const modalPlanName =
        document.getElementById(
            'modalPlanName'
        );


    const modalBenefitsList =
        document.getElementById(
            'modalBenefitsList'
        );


    // -----------------------------------------------------------------------
    // NOME DO PLANO
    // -----------------------------------------------------------------------

    if (modalPlanName) {

        modalPlanName.innerText =
            planName;

    }


    // -----------------------------------------------------------------------
    // BENEFÍCIOS
    // -----------------------------------------------------------------------

    if (modalBenefitsList) {

        modalBenefitsList.innerHTML =
            '';


        const beneficios =
            planosExclusivosInfo[planName] ||
            [
                'Benefícios padrão do sistema GeTech.'
            ];


        beneficios.forEach(
            (beneficio) => {

                const li =
                    document.createElement(
                        'li'
                    );


                li.innerText =
                    beneficio;


                modalBenefitsList.appendChild(
                    li
                );

            }
        );

    }


    // -----------------------------------------------------------------------
    // ABRIR MODAL
    // -----------------------------------------------------------------------

    if (modal) {

        modal.classList.add(
            'active'
        );

    }


    // -----------------------------------------------------------------------
    // ENTERPRISE
    //
    // Não grava como plano adquirido ainda.
    // O preço precisa ser definido pelo gestor.
    // -----------------------------------------------------------------------

    if (
        planName ===
        PLANO_SOB_CONSULTA
    ) {

        return;

    }


    // -----------------------------------------------------------------------
    // OUTROS PLANOS
    // -----------------------------------------------------------------------

    if (!usuarioAtual) {

        return;

    }


    try {

        await update(

            ref(
                db,
                `usuarios/${usuarioAtual.uid}`
            ),

            {

                planoAdquirido:
                    planName,

                planoAtualizadoEm:
                    Date.now()

            }

        );


        // ---------------------------------------------------------------
        // AUDITORIA
        //
        // Se a auditoria falhar, isso NÃO cancela a operação principal.
        // ---------------------------------------------------------------

        try {

            await registrarAuditoria(

                'Planos: plano selecionado',

                `Plano ${planName} selecionado.`,

                'info'

            );

        } catch (erroAuditoria) {

            console.warn(
                'Plano salvo, mas a auditoria falhou:',
                erroAuditoria
            );

        }

    } catch (erro) {

        console.error(
            'Erro ao salvar plano:',
            erro
        );

    }

}


// ===========================================================================
// SOLICITAR PLANO ENTERPRISE
// ===========================================================================
//
// FLUXO:
//
// 1. Verifica se o cliente está logado.
// 2. Consulta solicitacoesPlanos/{uid} no Firebase.
// 3. Se não existir:
//      cria a solicitação.
// 4. Se existir sem preço:
//      mantém a solicitação existente.
// 5. Se existir com preço:
//      usa o preço definido pelo gestor.
// 6. Vai para assinatura.html.
//
// ===========================================================================

async function solicitarPlanoSobConsulta() {

    // =======================================================================
    // VERIFICAR LOGIN
    // =======================================================================

    if (!usuarioAtual) {

        alert(
            'Faça login para solicitar o plano Enterprise.'
        );


        window.location.href =
            'login.html';


        return;

    }


    try {

        const uid =
            usuarioAtual.uid;


        const agora =
            Date.now();


        // ===================================================================
        // REFERÊNCIA DA SOLICITAÇÃO
        // ===================================================================

        const solicitacaoRef =
            ref(
                db,
                `solicitacoesPlanos/${uid}`
            );


        // ===================================================================
        // CONSULTAR FIREBASE
        // ===================================================================

        const snapshot =
            await get(
                solicitacaoRef
            );


        // ===================================================================
        // JÁ EXISTE SOLICITAÇÃO
        // ===================================================================

        if (
            snapshot.exists()
        ) {

            const solicitacao =
                snapshot.val();


            const preco =
                Number(
                    solicitacao.preco
                );


            // ===============================================================
            // PREÇO JÁ DEFINIDO PELO GESTOR
            // ===============================================================

            if (
                Number.isFinite(preco) &&
                preco > 0
            ) {

                console.log(
                    'Preço Enterprise encontrado no Firebase:',
                    formatarPreco(preco)
                );


                const checkoutSalvo =
                    salvarCheckout(

                        uid,

                        PLANO_SOB_CONSULTA,

                        preco

                    );


                if (!checkoutSalvo) {

                    alert(
                        'Não foi possível iniciar a assinatura.'
                    );


                    return;

                }


                // -----------------------------------------------------------
                // NÃO ALTERA A SOLICITAÇÃO.
                //
                // O preço permanece exatamente como o gestor definiu.
                // -----------------------------------------------------------

                window.location.href =
                    'assinatura.html';


                return;

            }


            // ===============================================================
            // SOLICITAÇÃO EXISTE, MAS AINDA NÃO TEM PREÇO
            // ===============================================================

            console.log(
                'Solicitação Enterprise encontrada. Aguardando preço do gestor.'
            );


            const checkoutSalvo =
                salvarCheckout(

                    uid,

                    PLANO_SOB_CONSULTA

                );


            if (!checkoutSalvo) {

                alert(
                    'Não foi possível iniciar a assinatura.'
                );


                return;

            }


            // ---------------------------------------------------------------
            // NÃO CRIA OUTRA SOLICITAÇÃO.
            // ---------------------------------------------------------------

            window.location.href =
                'assinatura.html';


            return;

        }


        // ===================================================================
        // NÃO EXISTE SOLICITAÇÃO
        // ===================================================================

        const nome =
            usuarioAtual.displayName ||
            'Cliente';


        const email =
            usuarioAtual.email ||
            '';


        // ===================================================================
        // CRIAR SOLICITAÇÃO NO FIREBASE
        // ===================================================================

        await set(

            solicitacaoRef,

            {

                uid:
                    uid,

                nome:
                    nome,

                email:
                    email,

                plano:
                    PLANO_SOB_CONSULTA,

                status:
                    'aguardando_preco',

                preco:
                    null,

                criadaEm:
                    agora,

                atualizadaEm:
                    agora

            }

        );


        console.log(
            'Solicitação Enterprise criada no Firebase.'
        );


        // ===================================================================
        // AUDITORIA
        // ===================================================================
        //
        // IMPORTANTE:
        // Se as Rules bloquearem a auditoria, a solicitação continua válida.
        // ===================================================================

        try {

            await registrarAuditoria(

                'Planos: preço sob consulta solicitado',

                `Cliente solicitou preço do plano ${PLANO_SOB_CONSULTA}.`,

                'info'

            );

        } catch (erroAuditoria) {

            console.warn(
                'Solicitação criada, mas a auditoria falhou:',
                erroAuditoria
            );

        }


        // ===================================================================
        // SALVAR CHECKOUT
        // ===================================================================

        const checkoutSalvo =
            salvarCheckout(

                uid,

                PLANO_SOB_CONSULTA

            );


        if (!checkoutSalvo) {

            alert(
                'A solicitação foi registrada, mas não foi possível abrir a assinatura.'
            );


            return;

        }


        // ===================================================================
        // IR PARA ASSINATURA
        // ===================================================================

        window.location.href =
            'assinatura.html';


    } catch (erro) {

        console.error(
            'ERRO AO SOLICITAR ENTERPRISE:',
            erro
        );


        console.error(
            'Código:',
            erro?.code
        );


        console.error(
            'Mensagem:',
            erro?.message
        );


        alert(
            'Não foi possível enviar a solicitação. Tente novamente.'
        );

    }

}


// ===========================================================================
// DISPONIBILIZAR FUNÇÕES PARA O HTML
// ===========================================================================

window.selectPlan =
    selectPlan;


window.solicitarPlanoSobConsulta =
    solicitarPlanoSobConsulta;


// ===========================================================================
// CARREGAR PLANO ATUAL
// ===========================================================================

async function carregarPlanoAtual(user) {

    if (!user) {

        return;

    }


    try {

        const snap =
            await get(

                ref(
                    db,
                    `usuarios/${user.uid}`
                )

            );


        const perfil =
            snap.exists()
                ? snap.val()
                : {};


        const plano =
            perfil.planoAdquirido;


        if (plano) {

            document.body.dataset.planoAtual =
                plano;

        }

    } catch (erro) {

        console.error(
            'Erro ao carregar plano atual:',
            erro
        );

    }

}


// ===========================================================================
// AUTENTICAÇÃO
// ===========================================================================

onAuthStateChanged(

    auth,

    async (user) => {

        usuarioAtual =
            user;


        if (user) {

            await carregarPlanoAtual(
                user
            );

        }

    }

);


// ===========================================================================
// DOM
// ===========================================================================

document.addEventListener(

    'DOMContentLoaded',

    () => {

        const modal =
            document.getElementById(
                'planModal'
            );


        const closeModal =
            document.getElementById(
                'closeModal'
            );


        const btnConfirmar =
            document.getElementById(
                'confirmarAssinaturaBtn'
            );


        // ===================================================================
        // FECHAR MODAL
        // ===================================================================

        closeModal?.addEventListener(

            'click',

            (event) => {

                event.preventDefault();

                event.stopPropagation();


                modal?.classList.remove(
                    'active'
                );

            }

        );


        // ===================================================================
        // FECHAR CLICANDO FORA
        // ===================================================================

        modal?.addEventListener(

            'click',

            (event) => {

                if (
                    event.target ===
                    modal
                ) {

                    event.preventDefault();

                    modal.classList.remove(
                        'active'
                    );

                }

            }

        );


        // ===================================================================
        // CONFIRMAR ASSINATURA
        // ===================================================================

        btnConfirmar?.addEventListener(

            'click',

            async (event) => {

                // -----------------------------------------------------------
                // IMPORTANTE:
                //
                // Impede que o botão envie o formulário e faça F5.
                // -----------------------------------------------------------

                event.preventDefault();

                event.stopPropagation();


                const plano =
                    planoSelecionadoAtual;


                // -----------------------------------------------------------
                // NENHUM PLANO
                // -----------------------------------------------------------

                if (!plano) {

                    return;

                }


                // ===========================================================
                // ENTERPRISE
                // ===========================================================

                if (
                    plano ===
                    PLANO_SOB_CONSULTA
                ) {

                    await solicitarPlanoSobConsulta();

                    return;

                }


                // ===========================================================
                // OUTROS PLANOS
                // ===========================================================

                if (!usuarioAtual) {

                    alert(
                        'Faça login para continuar com a assinatura.'
                    );


                    window.location.href =
                        'login.html';


                    return;

                }


                const checkoutSalvo =
                    salvarCheckout(

                        usuarioAtual.uid,

                        plano

                    );


                if (!checkoutSalvo) {

                    alert(
                        'Não foi possível iniciar a assinatura.'
                    );


                    return;

                }


                window.location.href =
                    'assinatura.html';

            }

        );


        // ===================================================================
        // ANIMAÇÃO DOS PLANOS
        // ===================================================================

        document
            .querySelectorAll(
                '.plan-card'
            )
            .forEach(

                (card, index) => {

                    card.style.opacity =
                        '0';


                    card.style.transform =
                        'translateY(20px)';


                    card.style.transition =
                        'all 0.4s ease';


                    setTimeout(

                        () => {

                            card.style.opacity =
                                '1';


                            card.style.transform =
                                'translateY(0)';

                        },

                        index * 200

                    );

                }

            );

    }

);  