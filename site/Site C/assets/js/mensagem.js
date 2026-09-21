// ============================================================================
// CAIXA DE MENSAGENS - FIREBASE
//
// Inclui:
// 1. Chamados do chatbot
// 2. Solicitações de preço dos planos sob consulta
// 3. Definição do preço pelo gestor
// 4. Exclusão das solicitações
// ============================================================================


import {
    auth,
    db
} from "./firebase-config.js";


import {
    ref,
    onValue,
    remove,
    set,
    update
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";


import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


import {
    registrarAuditoria
}
from "../../../app/assets/js/auditoria.js";


// ============================================================================
// ELEMENTOS
// ============================================================================

const containerMensagens =
    document.getElementById(
        "containerMensagens"
    );


const btnLimparTudo =
    document.getElementById(
        "btnLimparTudo"
    );


// ============================================================================
// REFERÊNCIAS FIREBASE
// ============================================================================

const chamadosRef =
    ref(
        db,
        "chamadosChatbot"
    );


const solicitacoesRef =
    ref(
        db,
        "solicitacoesPlanos"
    );


// ============================================================================
// CACHE
// ============================================================================

let chamadosCache = [];

let solicitacoesCache = [];


// ============================================================================
// SEGURANÇA HTML
// ============================================================================

function escaparHTML(valor) {

    return String(
        valor ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ============================================================================
// DATA
// ============================================================================

function formatarData(data) {

    if (!data) {

        return "Data não registrada";

    }


    const d =
        new Date(data);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return data;

    }


    return d.toLocaleString(
        "pt-BR"
    );

}


// ============================================================================
// PREÇO
// ============================================================================

function formatarPreco(valor) {

    const numero =
        Number(valor);


    if (
        !Number.isFinite(numero) ||
        numero <= 0
    ) {

        return "Preço sob consulta";

    }


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ============================================================================
// CARREGAR MENSAGENS
// ============================================================================

function carregarMensagens() {

    if (
        !containerMensagens ||
        !btnLimparTudo
    ) {

        return;

    }


    // ------------------------------------------------------------------------
    // ORDENA CHAMADOS
    // ------------------------------------------------------------------------

    const chamados =
        [...chamadosCache]
            .sort(
                (a, b) =>
                    new Date(
                        b.data || 0
                    ) -
                    new Date(
                        a.data || 0
                    )
            );


    // ------------------------------------------------------------------------
    // ORDENA SOLICITAÇÕES
    // ------------------------------------------------------------------------

    const solicitacoes =
        [...solicitacoesCache]
            .sort(
                (a, b) =>
                    Number(
                        b.atualizadaEm ||
                        b.criadaEm ||
                        0
                    ) -
                    Number(
                        a.atualizadaEm ||
                        a.criadaEm ||
                        0
                    )
            );


    // ------------------------------------------------------------------------
    // NENHUMA MENSAGEM
    // ------------------------------------------------------------------------

    if (
        !chamados.length &&
        !solicitacoes.length
    ) {

        btnLimparTudo.style.display =
            "none";


        containerMensagens.innerHTML = `

            <div class="sem-mensagens">

                <h3>
                    Sua caixa está limpa!
                </h3>

                <p>
                    Nenhuma mensagem,
                    solicitação de preço
                    ou ordem de serviço
                    foi recebida.
                </p>

            </div>

        `;


        return;

    }


    btnLimparTudo.style.display =
        "block";


    containerMensagens.innerHTML =
        "";


    // ========================================================================
    // SOLICITAÇÕES DE PREÇO
    // ========================================================================

    solicitacoes.forEach(
        (solicitacao) => {

            const card =
                document.createElement(
                    "div"
                );


            card.classList.add(
                "card-mensagem"
            );


            const numeroPreco =
                Number(
                    solicitacao.preco
                );


            const temPreco =
                Number.isFinite(
                    numeroPreco
                ) &&
                numeroPreco > 0;


            const status =
                temPreco
                    ? "Preço definido"
                    : "Aguardando preço";


            // ----------------------------------------------------------------
            // HTML DO CARD
            // ----------------------------------------------------------------

            card.innerHTML = `

                <div class="card-header-msg">

                    <span>

                        <strong>
                            Solicitação de Plano
                        </strong>

                    </span>


                    <span>

                        ${escaparHTML(
                            formatarData(
                                solicitacao.atualizadaEm ||
                                solicitacao.criadaEm
                            )
                        )}

                    </span>

                </div>


                <div class="card-body-msg">

                    <p>

                        <span class="label">
                            Cliente:
                        </span>

                        ${escaparHTML(
                            solicitacao.nome ||
                            "Cliente"
                        )}

                    </p>


                    <p>

                        <span class="label">
                            E-mail:
                        </span>

                        <a
                            href="mailto:${escaparHTML(
                                solicitacao.email || ""
                            )}"
                        >

                            ${escaparHTML(
                                solicitacao.email ||
                                "Não informado"
                            )}

                        </a>

                    </p>


                    <p>

                        <span class="label">
                            Plano:
                        </span>

                        ${escaparHTML(
                            solicitacao.plano ||
                            "Enterprise"
                        )}

                    </p>


                    <p>

                        <span class="label">
                            Status:
                        </span>

                        <strong>
                            ${status}
                        </strong>

                    </p>


                    <p>

                        <span class="label">
                            Preço atual:
                        </span>

                        <strong>

                            ${escaparHTML(
                                formatarPreco(
                                    solicitacao.preco
                                )
                            )}

                        </strong>

                    </p>


                    <div
                        style="
                            margin-top:16px;
                            padding:14px;
                            border-radius:10px;
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                        "
                    >

                        <label
                            style="
                                display:block;
                                font-weight:700;
                                margin-bottom:7px;
                            "
                        >

                            Definir preço mensal

                        </label>


                        <div
                            style="
                                display:flex;
                                gap:10px;
                                align-items:center;
                                flex-wrap:wrap;
                            "
                        >

                            <input

                                type="number"

                                min="0.01"

                                step="0.01"

                                class="input-preco-plano"

                                value="${
                                    temPreco
                                        ? escaparHTML(
                                            Number(
                                                solicitacao.preco
                                            ).toFixed(2)
                                        )
                                        : ""
                                }"

                                placeholder="Ex.: 2500.00"

                                style="
                                    padding:10px;
                                    border:1px solid #cbd5e1;
                                    border-radius:8px;
                                    max-width:220px;
                                "

                            >


                            <button
                                type="button"
                                class="btn-salvar-preco"
                            >

                                ${
                                    temPreco
                                        ? "Atualizar preço"
                                        : "Enviar preço ao cliente"
                                }

                            </button>

                        </div>

                    </div>

                </div>


                <div
                    style="
                        text-align:right;
                        margin-top:15px;
                    "
                >

                    <button
                        class="btn-deletar-unica"
                        type="button"
                    >

                        Excluir Solicitação

                    </button>

                </div>

            `;


            // ----------------------------------------------------------------
            // BOTÃO DE PREÇO
            // ----------------------------------------------------------------

            const btnSalvar =
                card.querySelector(
                    ".btn-salvar-preco"
                );


            btnSalvar?.addEventListener(
                "click",
                () => {

                    definirPreco(
                        solicitacao.uid,
                        card
                    );

                }
            );


            // ----------------------------------------------------------------
            // BOTÃO EXCLUIR
            // ----------------------------------------------------------------

            const btnExcluir =
                card.querySelector(
                    ".btn-deletar-unica"
                );


            btnExcluir?.addEventListener(
                "click",
                () => {

                    deletarSolicitacao(
                        solicitacao.uid
                    );

                }
            );


            containerMensagens.appendChild(
                card
            );

        }
    );


    // ========================================================================
    // CHAMADOS DO CHATBOT
    // ========================================================================

    chamados.forEach(
        (chamado, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.classList.add(
                "card-mensagem"
            );


            card.innerHTML = `

                <div class="card-header-msg">

                    <span>

                        <strong>
                            ID Chamado:
                        </strong>

                        #${index + 1}

                    </span>


                    <span>

                        ${escaparHTML(
                            formatarData(
                                chamado.data
                            )
                        )}

                    </span>

                </div>


                <div class="card-body-msg">

                    <p>

                        <span class="label">
                            Cliente:
                        </span>

                        ${escaparHTML(
                            chamado.nome
                        )}

                    </p>


                    <p>

                        <span class="label">
                            E-mail de Contato:
                        </span>

                        <a
                            href="mailto:${escaparHTML(
                                chamado.email
                            )}"
                        >

                            ${escaparHTML(
                                chamado.email
                            )}

                        </a>

                    </p>


                    <p>

                        <span class="label">
                            Status:
                        </span>

                        ${escaparHTML(
                            chamado.status ||
                            "Novo"
                        )}

                    </p>


                    <p class="problema-texto">

                        <span class="label">
                            Descrição do Problema:
                        </span>

                        <br>

                        ${escaparHTML(
                            chamado.problema
                        )}

                    </p>

                </div>


                <div
                    style="
                        text-align:right;
                        margin-top:15px;
                    "
                >

                    <button
                        class="btn-deletar-unica"
                        type="button"
                    >

                        Excluir Registro

                    </button>

                </div>

            `;


            card
                .querySelector(
                    "button"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        deletarMensagem(
                            chamado.id
                        );

                    }
                );


            containerMensagens.appendChild(
                card
            );

        }
    );

}


// ============================================================================
// DEFINIR PREÇO
// ============================================================================

async function definirPreco(
    uid,
    card
) {

    const input =
        card?.querySelector(
            ".input-preco-plano"
        );


    const preco =
        Number(
            input?.value
        );


    if (
        !uid ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {

        alert(
            "Informe um preço mensal maior que zero."
        );


        return;

    }


    // ------------------------------------------------------------------------
    // Confirmação
    // ------------------------------------------------------------------------

    const confirmar =
        confirm(

            `Deseja enviar o preço de ${formatarPreco(preco)} por mês para este cliente?`

        );


    if (!confirmar) {

        return;

    }


    try {

        // --------------------------------------------------------------------
        // Salva no Firebase
        // --------------------------------------------------------------------

        await update(

            ref(
                db,
                `solicitacoesPlanos/${uid}`
            ),

            {

                preco:
                    Number(
                        preco.toFixed(2)
                    ),

                status:
                    "preco_definido",

                atualizadoEm:
                    Date.now()

            }

        );


        // --------------------------------------------------------------------
        // Auditoria
        // --------------------------------------------------------------------

        await registrarAuditoria(

            'Mensagens: preço de plano definido',

            `Preço de ${formatarPreco(preco)} definido para a solicitação ${uid}.`,

            'info'

        );


        alert(
            `Preço de ${formatarPreco(preco)} enviado ao cliente.`
        );


    } catch (erro) {

        console.error(
            "Erro ao definir preço:",
            erro
        );


        alert(
            "Não foi possível enviar o preço ao cliente."
        );

    }

}


// ============================================================================
// DELETAR SOLICITAÇÃO
// ============================================================================

async function deletarSolicitacao(
    uid
) {

    if (!uid) {

        return;

    }


    if (
        !confirm(
            "Tem certeza que deseja excluir esta solicitação de preço?"
        )
    ) {

        return;

    }


    try {

        await remove(

            ref(
                db,
                `solicitacoesPlanos/${uid}`
            )

        );


        await registrarAuditoria(

            'Mensagens: solicitação de preço excluída',

            `Solicitação ${uid} excluída.`,

            'warning'

        );


    } catch (erro) {

        console.error(
            "Erro ao excluir solicitação:",
            erro
        );


        alert(
            "Não foi possível excluir a solicitação."
        );

    }

}


// ============================================================================
// DELETAR CHAMADO
// ============================================================================

async function deletarMensagem(
    id
) {

    if (!id) {

        return;

    }


    if (
        !confirm(
            "Tem certeza que deseja apagar este registro de atendimento?"
        )
    ) {

        return;

    }


    try {

        await remove(

            ref(
                db,
                `chamadosChatbot/${id}`
            )

        );


        await registrarAuditoria(

            'Mensagens: chamado excluído',

            `Chamado ${id} excluído da caixa de mensagens.`,

            'warning'

        );


    } catch (erro) {

        console.error(
            "Erro ao excluir chamado:",
            erro
        );


        alert(
            "Não foi possível excluir o registro."
        );

    }

}


// ============================================================================
// LIMPAR TODAS AS MENSAGENS
// ============================================================================

async function limparTodasMensagens() {

    if (
        !confirm(
            "ATENÇÃO: Você tem certeza que deseja apagar TODAS as mensagens recebidas? Esta ação não pode ser desfeita."
        )
    ) {

        return;

    }


    try {

        await Promise.all([

            set(
                chamadosRef,
                null
            ),

            set(
                solicitacoesRef,
                null
            )

        ]);


        await registrarAuditoria(

            'Mensagens: caixa limpa',

            'Todos os chamados e solicitações da caixa de mensagens foram excluídos.',

            'warning'

        );


    } catch (erro) {

        console.error(
            "Erro ao limpar chamados:",
            erro
        );


        alert(
            "Não foi possível limpar a caixa de mensagens."
        );

    }

}


// ============================================================================
// AUTENTICAÇÃO DO GESTOR
// ============================================================================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            if (containerMensagens) {

                containerMensagens.innerHTML = `

                    <div class="sem-mensagens">

                        <h3>
                            Acesso necessário
                        </h3>

                        <p>
                            Faça login para visualizar os chamados.
                        </p>

                    </div>

                `;

            }


            return;

        }


        // ====================================================================
        // CHAMADOS
        // ====================================================================

        onValue(

            chamadosRef,

            (snapshot) => {

                const dados =
                    snapshot.val() || {};


                chamadosCache =
                    Object.entries(
                        dados
                    )
                    .map(
                        ([id, chamado]) => ({
                            id,
                            ...chamado
                        })
                    );


                carregarMensagens();

            }

        );


        // ====================================================================
        // SOLICITAÇÕES
        // ====================================================================

        onValue(

            solicitacoesRef,

            (snapshot) => {

                const dados =
                    snapshot.val() || {};


                solicitacoesCache =
                    Object.entries(
                        dados
                    )
                    .map(
                        ([uid, solicitacao]) => ({
                            uid,
                            ...solicitacao
                        })
                    );


                carregarMensagens();

            }

        );

    }

);


// ============================================================================
// FUNÇÕES GLOBAIS PARA O HTML
// ============================================================================

window.deletarMensagem =
    deletarMensagem;


window.limparTodasMensagens =
    limparTodasMensagens;