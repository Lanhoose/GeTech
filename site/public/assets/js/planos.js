// ===========================================================================
// planos.js - GeTech
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

const BASE_URL =
    window.location.origin + '/GeTech';

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


    if (modalPlanName) {

        modalPlanName.innerText =
            planName;

    }


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


    if (modal) {

        modal.classList.add(
            'active'
        );

    }


    // -----------------------------------------------------------------------
    // IMPORTANTE:
    // Não bloqueamos o Enterprise por causa de autenticação aqui.
    // A autenticação será verificada somente quando o usuário confirmar.
    // -----------------------------------------------------------------------

    if (!usuarioAtual) {

        console.warn(
            'Plano selecionado visualmente. Usuário ainda não autenticado.'
        );

        return;

    }


    // -----------------------------------------------------------------------
    // ENTERPRISE
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
                'Auditoria não registrada:',
                erroAuditoria
            );

        }


        console.log(
            `Plano ${planName} salvo no Firebase.`
        );

    } catch (erro) {

        console.error(
            'Erro ao salvar plano:',
            erro
        );

    }

}


// ===========================================================================
// SOLICITAR ENTERPRISE
// ===========================================================================

async function solicitarPlanoSobConsulta() {

    // ============================================================
    // VERIFICAR LOGIN
    // ============================================================

    if (!usuarioAtual) {

        alert(
            "Faça login para solicitar o plano Enterprise."
        );

        window.location.href = "login.html";

        return;
    }


    try {

        const uid =
            usuarioAtual.uid;

        const agora =
            Date.now();


        // ============================================================
        // VERIFICAR SE JÁ EXISTE UMA SOLICITAÇÃO
        // ============================================================

        const solicitacaoRef =
            ref(
                db,
                `solicitacoesPlanos/${uid}`
            );


        const solicitacaoSnap =
            await get(
                solicitacaoRef
            );


        // ============================================================
        // SE JÁ EXISTIR
        // ============================================================

        if (solicitacaoSnap.exists()) {

            const solicitacao =
                solicitacaoSnap.val();


            // --------------------------------------------------------
            // JÁ TEM PREÇO DEFINIDO
            // --------------------------------------------------------

            const preco =
                Number(
                    solicitacao.preco
                );


            if (
                Number.isFinite(preco) &&
                preco > 0
            ) {

                try {

                    localStorage.setItem(

                        CHAVE_CHECKOUT,

                        JSON.stringify({

                            plano:
                                "Enterprise",

                            uid,

                            criadoEm:
                                agora

                        })

                    );

                } catch (erroStorage) {

                    console.warn(
                        "Não foi possível salvar o checkout:",
                        erroStorage
                    );

                }


                // O preço já foi definido pelo gestor.
                // Não tentamos criar outra solicitação.

                window.location.href =
                    "assinatura.html";

                return;

            }


            // --------------------------------------------------------
            // AINDA ESTÁ AGUARDANDO O GESTOR
            // --------------------------------------------------------

            try {

                localStorage.setItem(

                    CHAVE_CHECKOUT,

                    JSON.stringify({

                        plano:
                            "Enterprise",

                        uid,

                        criadoEm:
                            agora

                    })

                );

            } catch (erroStorage) {

                console.warn(
                    "Não foi possível salvar o checkout:",
                    erroStorage
                );

            }


            // Já existe uma solicitação.
            // Não criamos outra e não sobrescrevemos a atual.

            window.location.href =
                "assinatura.html";

            return;

        }


        // ============================================================
        // PRIMEIRA SOLICITAÇÃO
        // ============================================================

        const nome =
            usuarioAtual.displayName ||
            "Cliente";


        const email =
            usuarioAtual.email ||
            "";


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
                    "Enterprise",

                status:
                    "aguardando_preco",

                criadaEm:
                    agora,

                atualizadaEm:
                    agora

            }

        );


        // ============================================================
        // AUDITORIA
        // ============================================================

        try {

            await registrarAuditoria(

                "Planos: preço sob consulta solicitado",

                `Cliente solicitou preço do plano Enterprise.`,

                "info"

            );

        } catch (erroAuditoria) {

            console.warn(
                "Solicitação criada, mas auditoria falhou:",
                erroAuditoria
            );

        }


        // ============================================================
        // SALVAR CHECKOUT
        // ============================================================

        try {

            localStorage.setItem(

                CHAVE_CHECKOUT,

                JSON.stringify({

                    plano:
                        "Enterprise",

                    uid:
                        uid,

                    criadoEm:
                        agora

                })

            );

        } catch (erroStorage) {

            console.warn(
                "Não foi possível salvar o checkout:",
                erroStorage
            );

        }


        // ============================================================
        // IR PARA ASSINATURA
        // ============================================================

        window.location.href =
            "assinatura.html";


    } catch (erro) {

        console.error(
            "ERRO COMPLETO AO SOLICITAR ENTERPRISE:",
            erro
        );


        alert(
            "Não foi possível enviar a solicitação. Tente novamente."
        );

    }

}

// ===========================================================================
// DISPONIBILIZA AS FUNÇÕES PARA O HTML
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
            'Erro ao carregar plano:',
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


        // -------------------------------------------------------------------
        // FECHAR MODAL
        // -------------------------------------------------------------------

        closeModal?.addEventListener(

            'click',

            () => {

                modal?.classList.remove(
                    'active'
                );

            }

        );


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


        // -------------------------------------------------------------------
        // CONFIRMAR ASSINATURA
        // -------------------------------------------------------------------

        btnConfirmar?.addEventListener(

            'click',

            async () => {

                const plano =
                    planoSelecionadoAtual;


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

                try {

                    localStorage.setItem(

                        CHAVE_CHECKOUT,

                        JSON.stringify({

                            plano,

                            uid:
                                usuarioAtual?.uid ||
                                null,

                            criadoEm:
                                Date.now()

                        })

                    );

                } catch (erro) {

                    console.error(
                        'Não foi possível iniciar o checkout:',
                        erro
                    );


                    alert(
                        'Não foi possível iniciar a assinatura. Verifique se o navegador permite armazenamento e tente novamente.'
                    );


                    return;

                }


                window.location.href =
                    'assinatura.html';

            }

        );


        // -------------------------------------------------------------------
        // ANIMAÇÃO DOS PLANOS
        // -------------------------------------------------------------------

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