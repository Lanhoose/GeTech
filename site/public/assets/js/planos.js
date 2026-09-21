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


const BASE_URL = window.location.origin + '/GeTech';


// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const CHAVE_CHECKOUT = 'getech:checkout';

const PLANO_SOB_CONSULTA = 'Enterprise';

const VALIDADE_CHECKOUT = 30 * 60 * 1000;


// ============================================================================
// VARIÁVEIS
// ============================================================================

let usuarioAtual = null;

let planoSelecionadoAtual = '';


// ============================================================================
// INFORMAÇÕES DOS PLANOS
// ============================================================================

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


// ============================================================================
// SELECIONAR PLANO
// ============================================================================

async function selectPlan(planName) {

    planoSelecionadoAtual = planName;


    const modal =
        document.getElementById('planModal');

    const modalPlanName =
        document.getElementById('modalPlanName');

    const modalBenefitsList =
        document.getElementById('modalBenefitsList');


    if (modalPlanName) {

        modalPlanName.innerText =
            planName;

    }


    if (modalBenefitsList) {

        modalBenefitsList.innerHTML = '';


        const beneficios =
            planosExclusivosInfo[planName] ||
            [
                'Benefícios padrão do sistema GeTech.'
            ];


        beneficios.forEach((beneficio) => {

            const li =
                document.createElement('li');

            li.innerText =
                beneficio;

            modalBenefitsList.appendChild(li);

        });

    }


    if (modal) {

        modal.classList.add('active');

    }


    // Se não estiver logado, o modal ainda pode ser visualizado.
    // A validação será feita ao confirmar.
    if (!usuarioAtual) {

        console.warn(
            'Plano selecionado visualmente: usuário ainda não autenticado.'
        );

        return;

    }


    // Enterprise não altera o plano do usuário neste momento.
    // Ele primeiro precisa passar pelo processo "Sob Consulta".
    if (planName === PLANO_SOB_CONSULTA) {

        return;

    }


    try {

        await update(
            ref(
                db,
                `usuarios/${usuarioAtual.uid}`
            ),
            {
                planoAdquirido: planName,

                planoAtualizadoEm:
                    Date.now()
            }
        );


        await registrarAuditoria(
            'Planos: plano selecionado',

            `Plano ${planName} selecionado.`,

            'info'
        );


    } catch (erro) {

        console.error(
            'Erro ao salvar plano:',
            erro
        );

    }

}


// ============================================================================
// SOLICITAR PLANO SOB CONSULTA
// ============================================================================

async function solicitarPlanoSobConsulta() {

    if (!usuarioAtual) {

        alert(
            'Faça login para solicitar um preço personalizado.'
        );

        window.location.href =
            'login.html';

        return;

    }


    const agora =
        Date.now();


    try {

        // --------------------------------------------------------------------
        // Busca os dados do usuário
        // --------------------------------------------------------------------

        const perfilSnap =
            await get(
                ref(
                    db,
                    `usuarios/${usuarioAtual.uid}`
                )
            );


        const perfil =
            perfilSnap.exists()
                ? perfilSnap.val()
                : {};


        const nome =
            perfil.nome ||
            perfil.nomeCompleto ||
            usuarioAtual.displayName ||
            'Cliente';


        const email =
            perfil.email ||
            usuarioAtual.email ||
            '';


        // --------------------------------------------------------------------
        // Cria / atualiza a solicitação
        // --------------------------------------------------------------------

        await set(

            ref(
                db,
                `solicitacoesPlanos/${usuarioAtual.uid}`
            ),

            {

                uid:
                    usuarioAtual.uid,

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


        // --------------------------------------------------------------------
        // Auditoria
        // --------------------------------------------------------------------

        await registrarAuditoria(

            'Planos: preço sob consulta solicitado',

            `Cliente solicitou preço do plano ${PLANO_SOB_CONSULTA}.`,

            'info'

        );


        // --------------------------------------------------------------------
        // Autoriza o checkout
        // --------------------------------------------------------------------

        try {

            sessionStorage.setItem(

                CHAVE_CHECKOUT,

                JSON.stringify({

                    plano:
                        PLANO_SOB_CONSULTA,

                    criadoEm:
                        agora

                })

            );

        } catch (erroStorage) {

            console.warn(
                'Não foi possível salvar a autorização do checkout.',
                erroStorage
            );

        }


        // --------------------------------------------------------------------
        // Vai para assinatura
        // --------------------------------------------------------------------

        window.location.href =
            'assinatura.html';


    } catch (erro) {

        console.error(
            'Erro ao enviar solicitação de preço:',
            erro
        );


        alert(
            'Não foi possível enviar a solicitação. Tente novamente.'
        );

    }

}


// Disponibiliza para o HTML
window.solicitarPlanoSobConsulta =
    solicitarPlanoSobConsulta;


window.selectPlan =
    selectPlan;


// ============================================================================
// CARREGAR PLANO ATUAL
// ============================================================================

async function carregarPlanoAtual(user) {

    if (!user) return;


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


// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

onAuthStateChanged(
    auth,
    async (user) => {

        usuarioAtual =
            user;


        if (user) {

            await carregarPlanoAtual(user);

        }

    }
);


// ============================================================================
// DOM
// ============================================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const modal =
            document.getElementById('planModal');


        const closeModal =
            document.getElementById('closeModal');


        const btnConfirmar =
            document.getElementById(
                'confirmarAssinaturaBtn'
            );


        // --------------------------------------------------------------------
        // Fechar modal
        // --------------------------------------------------------------------

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

                if (e.target === modal) {

                    modal.classList.remove(
                        'active'
                    );

                }

            }
        );


        // --------------------------------------------------------------------
        // CONFIRMAR ASSINATURA
        // --------------------------------------------------------------------

        btnConfirmar?.addEventListener(

            'click',

            async () => {

                const plano =
                    planoSelecionadoAtual;


                if (!plano) {

                    return;

                }


                // ============================================================
                // ENTERPRISE / SOB CONSULTA
                // ============================================================

                if (
                    plano ===
                    PLANO_SOB_CONSULTA
                ) {

                    await solicitarPlanoSobConsulta();

                    return;

                }


                // ============================================================
                // PLANOS NORMAIS
                // ============================================================

                try {

                    sessionStorage.setItem(

                        CHAVE_CHECKOUT,

                        JSON.stringify({

                            plano:
                                plano,

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
                        'Não foi possível iniciar a assinatura. Verifique se o navegador permite armazenamento de sessão e tente novamente.'
                    );


                    return;

                }


                window.location.href =
                    'assinatura.html';

            }

        );


        // --------------------------------------------------------------------
        // ANIMAÇÃO DOS CARDS
        // --------------------------------------------------------------------

        document
            .querySelectorAll('.plan-card')
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