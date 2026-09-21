// ===========================================================================
// planos.js - GeTech
// Página de planos
// ===========================================================================

import { auth, db } from '../../../Site C/assets/js/firebase-config.js';

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
    // SE NÃO ESTIVER LOGADO
    // -----------------------------------------------------------------------

    if (!usuarioAtual) {

        console.warn(
            'Plano selecionado. Usuário ainda não autenticado.'
        );

        return;

    }


    // -----------------------------------------------------------------------
    // ENTERPRISE
    //
    // Enterprise não é salvo como plano adquirido aqui.
    // Primeiro precisa passar pela solicitação de preço.
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
        // VERIFICAR SE JÁ EXISTE UMA SOLICITAÇÃO
        // ===================================================================

        const solicitacaoSnap =
            await get(
                solicitacaoRef
            );


        // ===================================================================
        // SE JÁ EXISTIR
        // ===================================================================

        if (
            solicitacaoSnap.exists()
        ) {

            const solicitacao =
                solicitacaoSnap.val();


            const preco =
                Number(
                    solicitacao.preco
                );


            // ===============================================================
            // JÁ TEM PREÇO DEFINIDO
            // ===============================================================

            if (
                Number.isFinite(preco) &&
                preco > 0
            ) {

                try {

                    localStorage.setItem(

                        CHAVE_CHECKOUT,

                        JSON.stringify({

                            plano:
                                PLANO_SOB_CONSULTA,

                            uid:
                                uid,

                            criadoEm:
                                agora

                        })

                    );

                } catch (erroStorage) {

                    console.warn(
                        'Não foi possível salvar o checkout:',
                        erroStorage
                    );

                }


                window.location.href =
                    'assinatura.html';


                return;

            }


            // ===============================================================
            // AINDA ESTÁ AGUARDANDO O GESTOR
            // ===============================================================

            try {

                localStorage.setItem(

                    CHAVE_CHECKOUT,

                    JSON.stringify({

                        plano:
                            PLANO_SOB_CONSULTA,

                        uid:
                            uid,

                        criadoEm:
                            agora

                    })

                );

            } catch (erroStorage) {

                console.warn(
                    'Não foi possível salvar o checkout:',
                    erroStorage
                );

            }


            window.location.href =
                'assinatura.html';


            return;

        }


        // ===================================================================
        // PRIMEIRA SOLICITAÇÃO
        // ===================================================================

        const nome =
            usuarioAtual.displayName ||
            'Cliente';


        const email =
            usuarioAtual.email ||
            '';


        // ===================================================================
        // CRIAR SOLICITAÇÃO
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

                criadaEm:
                    agora,

                atualizadaEm:
                    agora

            }

        );


        // ===================================================================
        // AUDITORIA
        // ===================================================================

        try {

            await registrarAuditoria(

                'Planos: preço sob consulta solicitado',

                `Cliente solicitou preço do plano ${PLANO_SOB_CONSULTA}.`,

                'info'

            );

        } catch (erroAuditoria) {

            console.warn(
                'Solicitação criada, mas auditoria falhou:',
                erroAuditoria
            );

        }


        // ===================================================================
        // SALVAR CHECKOUT
        //
        // localStorage é utilizado para que a informação permaneça
        // mesmo depois que o cliente fechar a página.
        // ===================================================================

        try {

            localStorage.setItem(

                CHAVE_CHECKOUT,

                JSON.stringify({

                    plano:
                        PLANO_SOB_CONSULTA,

                    uid:
                        uid,

                    criadoEm:
                        agora

                })

            );

        } catch (erroStorage) {

            console.warn(
                'Não foi possível salvar o checkout:',
                erroStorage
            );

        }


        // ===================================================================
        // IR PARA ASSINATURA
        // ===================================================================

        window.location.href =
            'assinatura.html';


    } catch (erro) {

        console.error(
            'ERRO COMPLETO AO SOLICITAR ENTERPRISE:',
            erro
        );


        alert(
            'Não foi possível enviar a solicitação. Tente novamente.'
        );

    }

}


// ===========================================================================
// DISPONIBILIZAR FUNÇÕES PARA O HTML
// ===========================================================================

window.solicitarPlanoSobConsulta =
    solicitarPlanoSobConsulta;


window.selectPlan =
    selectPlan;


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

            () => {

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

            (e) => {

                if (
                    e.target ===
                    modal
                ) {

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

            async () => {

                const plano =
                    planoSelecionadoAtual;


                // -----------------------------------------------------------
                // NENHUM PLANO SELECIONADO
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


                try {

                    localStorage.setItem(

                        CHAVE_CHECKOUT,

                        JSON.stringify({

                            plano:

                                plano,

                            uid:

                                usuarioAtual.uid,

                            criadoEm:

                                Date.now()

                        })

                    );

                } catch (erroStorage) {

                    console.error(
                        'Erro ao salvar checkout:',
                        erroStorage
                    );


                    alert(
                        'Não foi possível iniciar a assinatura. Verifique o armazenamento do navegador.'
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