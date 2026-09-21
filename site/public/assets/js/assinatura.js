// ===========================================================================
// assinatura.js
//
// Página de checkout (assinatura.html). Responsável por:
//   1. Só liberar a página se o usuário chegou clicando em "Confirmar
//      Assinatura" na página de planos (trava via sessionStorage).
//   2. Puxar o plano escolhido e preencher o resumo (nome, preço, benefícios).
//   3. Abas de forma de pagamento, máscaras e validação do formulário.
//   4. Salvar a assinatura no Firebase (usuarios/{uid}) e registrar auditoria.
//
// IMPORTANTE: dados de cartão (número, validade, CVC) NUNCA são salvos.
// ===========================================================================

import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { ref, update } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';
import { registrarAuditoria } from '../../../app/assets/js/auditoria.js';

// --------------------------- Configurações ---------------------------------

// Mesma chave gravada em planos.js quando o botão "Confirmar Assinatura" é clicado.
const CHAVE_CHECKOUT = 'getech:checkout';
const VALIDADE_CHECKOUT_MS = 30 * 60 * 1000; // 30 minutos
const PAGINA_PLANOS = 'planos.html';
const PAGINA_APOS_ASSINAR = 'index.html';

// Catálogo dos planos (preço = valor mensal em reais; null = sob consulta).
// Os textos dos benefícios são os mesmos exibidos no modal de planos.html.
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

const PAINEIS_PAGAMENTO = {
    card: 'paymentCardContent',
    pix: 'paymentPixContent',
    boleto: 'paymentBoletoContent'
};

const CAMPOS_CARTAO = ['cardNumber', 'cardName', 'cardExpiry', 'cardCvc'];

// --------------------------- Utilitários -----------------------------------

const $ = (id) => document.getElementById(id);
const valor = (id) => ($(id)?.value || '').trim();
const soDigitos = (texto) => String(texto || '').replace(/\D/g, '');

function temPlano(nome) {
    return Object.prototype.hasOwnProperty.call(PLANOS, nome);
}

function formatarPrecoCurto(preco) {
    return 'R$ ' + preco.toLocaleString('pt-BR');
}

function formatarPrecoCompleto(preco) {
    return 'R$ ' + preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --------------------------- Trava de acesso -------------------------------

// Devolve { plano, criadoEm } se o usuário veio do botão "Confirmar Assinatura"
// e a autorização ainda é válida. Caso contrário, devolve null.
function lerCheckoutAutorizado() {
    try {
        const bruto = sessionStorage.getItem(CHAVE_CHECKOUT);
        if (!bruto) return null;

        const dados = JSON.parse(bruto);
        if (!dados || !temPlano(dados.plano)) return null;

        const idade = Date.now() - Number(dados.criadoEm);
        if (!Number.isFinite(idade) || idade < 0 || idade > VALIDADE_CHECKOUT_MS) return null;

        return dados;
    } catch {
        return null;
    }
}

function limparCheckout() {
    try {
        sessionStorage.removeItem(CHAVE_CHECKOUT);
    } catch {
        // sem storage disponível: nada a limpar
    }
}

function voltarParaPlanos() {
    window.location.replace(PAGINA_PLANOS);
}

// --------------------------- Resumo do plano -------------------------------

function preencherResumo(nomePlano) {
    const plano = PLANOS[nomePlano];

    const titulo = $('checkoutPlanTitle');
    if (titulo) titulo.textContent = nomePlano;

    const precoGrande = $('checkoutPlanPrice');
    if (precoGrande) {
        precoGrande.textContent = '';
        if (plano.preco === null) {
            precoGrande.textContent = 'Sob Consulta';
        } else {
            precoGrande.append(formatarPrecoCurto(plano.preco));
            const sufixo = document.createElement('span');
            sufixo.textContent = '/mês';
            precoGrande.appendChild(sufixo);
        }
    }

    const total = $('checkoutTotalPrice');
    if (total) {
        total.textContent = plano.preco === null ? 'Sob Consulta' : formatarPrecoCompleto(plano.preco);
    }

    const lista = $('checkoutBenefitsList');
    if (lista) {
        lista.innerHTML = '';
        plano.beneficios.forEach((beneficio) => {
            const li = document.createElement('li');
            li.textContent = beneficio;
            lista.appendChild(li);
        });
    }

    document.title = `Assinatura ${nomePlano} - GeTech ERP`;
}

// --------------------------- Máscaras --------------------------------------

function mascaraDocumento(texto) {
    const d = soDigitos(texto).slice(0, 14);

    if (d.length <= 11) {
        // CPF: 000.000.000-00
        let r = d.slice(0, 3);
        if (d.length > 3) r += '.' + d.slice(3, 6);
        if (d.length > 6) r += '.' + d.slice(6, 9);
        if (d.length > 9) r += '-' + d.slice(9, 11);
        return r;
    }

    // CNPJ: 00.000.000/0000-00
    let r = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}`;
    if (d.length > 12) r += '-' + d.slice(12, 14);
    return r;
}

function mascaraTelefone(texto) {
    const d = soDigitos(texto).slice(0, 11);
    if (!d) return '';
    if (d.length < 3) return `(${d}`;

    const corte = d.length > 10 ? 7 : 6; // celular (9 dígitos) ou fixo (8 dígitos)
    let r = `(${d.slice(0, 2)}) ${d.slice(2, corte)}`;
    if (d.length > corte) r += '-' + d.slice(corte);
    return r;
}

function mascaraCep(texto) {
    const d = soDigitos(texto).slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function mascaraCartao(texto) {
    return soDigitos(texto).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function mascaraValidade(texto) {
    const d = soDigitos(texto).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function mascaraCvc(texto) {
    return soDigitos(texto).slice(0, 4);
}

function aplicarMascara(idCampo, funcaoMascara) {
    const campo = $(idCampo);
    if (!campo) return;
    campo.addEventListener('input', () => {
        campo.value = funcaoMascara(campo.value);
    });
}

// --------------------------- Forma de pagamento ----------------------------

let metodoAtual = 'card';

function selecionarMetodo(metodo) {
    if (!Object.prototype.hasOwnProperty.call(PAINEIS_PAGAMENTO, metodo)) return;
    metodoAtual = metodo;

    document.querySelectorAll('.tab-btn').forEach((aba) => {
        aba.classList.toggle('active', aba.dataset.method === metodo);
    });

    Object.entries(PAINEIS_PAGAMENTO).forEach(([chave, idPainel]) => {
        $(idPainel)?.classList.toggle('active', chave === metodo);
    });

    // Campos do cartão só são obrigatórios quando a aba "Cartão" está ativa.
    // (Campo obrigatório escondido travaria o envio do formulário.)
    CAMPOS_CARTAO.forEach((id) => {
        const campo = $(id);
        if (campo) campo.required = metodo === 'card';
    });
}

// --------------------------- Validação -------------------------------------

function validarFormulario() {
    const documento = soDigitos(valor('docNumber'));
    if (documento.length !== 11 && documento.length !== 14) {
        return 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.';
    }

    if (soDigitos(valor('phone')).length < 10) {
        return 'Informe um telefone válido com DDD.';
    }

    if (soDigitos(valor('zipCode')).length !== 8) {
        return 'Informe um CEP válido com 8 dígitos.';
    }

    if (metodoAtual === 'card') {
        const numero = soDigitos(valor('cardNumber'));
        if (numero.length < 13 || numero.length > 16) {
            return 'Informe um número de cartão válido.';
        }

        const validade = valor('cardExpiry');
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validade)) {
            return 'Informe a validade do cartão no formato MM/AA.';
        }
        const [mes, ano] = validade.split('/').map(Number);
        const fimDaValidade = new Date(2000 + ano, mes, 1); // 1º dia do mês seguinte
        if (fimDaValidade <= new Date()) {
            return 'O cartão informado está vencido.';
        }

        const cvc = soDigitos(valor('cardCvc'));
        if (cvc.length < 3 || cvc.length > 4) {
            return 'Informe o código de segurança (CVC) do cartão.';
        }
    }

    return null;
}

// --------------------------- Envio -----------------------------------------

function definirStatus(plano, metodo) {
    if (plano.preco === null) return 'aguardando_contato';
    return metodo === 'card' ? 'ativa' : 'aguardando_pagamento';
}

function montarMensagemSucesso(nomePlano, plano, metodo) {
    if (plano.preco === null) {
        return `Solicitação do plano ${nomePlano} registrada! Nossa equipe entrará em contato para apresentar a proposta.`;
    }
    if (metodo === 'pix') {
        return `Assinatura do plano ${nomePlano} registrada! Conclua o pagamento via PIX para liberar o acesso.`;
    }
    if (metodo === 'boleto') {
        return `Assinatura do plano ${nomePlano} registrada! O acesso é liberado após a compensação do boleto (até 2 dias úteis).`;
    }
    return `Assinatura do plano ${nomePlano} ativada com sucesso!`;
}

async function finalizarAssinatura(checkout, botao) {
    const usuario = auth.currentUser;
    if (!usuario) {
        alert('Sua sessão expirou. Faça login novamente para concluir a assinatura.');
        window.location.href = 'login.html';
        return;
    }

    const nomePlano = checkout.plano;
    const plano = PLANOS[nomePlano];
    const agora = Date.now();

    const assinatura = {
        plano: nomePlano,
        recorrencia: valor('installments') === '12' ? 'anual_12x' : 'mensal',
        metodoPagamento: metodoAtual,
        status: definirStatus(plano, metodoAtual),
        criadaEm: agora,
        dadosFaturamento: {
            nome: valor('fullName'),
            documento: soDigitos(valor('docNumber')),
            email: valor('email'),
            telefone: soDigitos(valor('phone')),
            cep: soDigitos(valor('zipCode')),
            logradouro: valor('street'),
            numero: valor('number'),
            complemento: valor('complement'),
            bairro: valor('neighborhood'),
            cidade: valor('city'),
            uf: valor('state')
        }
    };

    if (plano.preco !== null) assinatura.valorMensal = plano.preco;
    if (metodoAtual === 'card') {
        // Apenas os 4 últimos dígitos, para identificação. Nunca salvar número completo / CVC.
        assinatura.cartaoFinal = soDigitos(valor('cardNumber')).slice(-4);
    }

    const textoOriginal = botao.textContent;
    botao.disabled = true;
    botao.textContent = 'Processando...';

    try {
        await update(ref(db, `usuarios/${usuario.uid}`), {
            planoAdquirido: nomePlano,
            planoAtualizadoEm: agora,
            assinatura
        });

        await registrarAuditoria(
            'Assinatura: plano contratado',
            `Plano ${nomePlano} contratado via ${metodoAtual} (status: ${assinatura.status}).`,
            'info'
        );

        limparCheckout();
        alert(montarMensagemSucesso(nomePlano, plano, metodoAtual));
        window.location.href = PAGINA_APOS_ASSINAR;
    } catch (erro) {
        console.error('Erro ao salvar assinatura:', erro);
        alert('Não foi possível concluir a assinatura. Tente novamente em instantes.');
        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
}

// --------------------------- Inicialização ---------------------------------

function iniciar(checkout) {
    preencherResumo(checkout.plano);

    // Máscaras
    aplicarMascara('docNumber', mascaraDocumento);
    aplicarMascara('phone', mascaraTelefone);
    aplicarMascara('zipCode', mascaraCep);
    aplicarMascara('cardNumber', mascaraCartao);
    aplicarMascara('cardExpiry', mascaraValidade);
    aplicarMascara('cardCvc', mascaraCvc);

    // Abas de pagamento
    document.querySelectorAll('.tab-btn').forEach((aba) => {
        aba.addEventListener('click', () => selecionarMetodo(aba.dataset.method));
    });
    selecionarMetodo('card');

    // Ao voltar para os planos, a autorização é descartada:
    // para abrir o checkout de novo é preciso clicar no botão outra vez.
    document.querySelector('.back-link')?.addEventListener('click', limparCheckout);

    // Envio do formulário
    const formulario = $('subscriptionForm');
    const botaoEnviar = $('submitSubscriptionBtn');
    let enviando = false;

    formulario?.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (enviando) return;

        // Revalida a autorização: pode ter expirado com a página aberta.
        if (!lerCheckoutAutorizado()) {
            alert('Sua sessão de assinatura expirou. Escolha o plano novamente.');
            voltarParaPlanos();
            return;
        }

        const erro = validarFormulario();
        if (erro) {
            alert(erro);
            return;
        }

        enviando = true;
        try {
            await finalizarAssinatura(checkout, botaoEnviar);
        } finally {
            enviando = false;
        }
    });
}

const checkoutAutorizado = lerCheckoutAutorizado();

if (!checkoutAutorizado) {
    // Acesso direto (URL digitada, favorito, link externo, autorização expirada...)
    voltarParaPlanos();
} else {
    iniciar(checkoutAutorizado);
}

// Se o navegador restaurar a página do cache (botão voltar/avançar) depois
// de a autorização ter sido descartada, expulsa o usuário de volta aos planos.
window.addEventListener('pageshow', (evento) => {
    if (evento.persisted && !lerCheckoutAutorizado()) voltarParaPlanos();
});