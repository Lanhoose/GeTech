import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';
import { registrarAuditoria } from '../../../app/assets/js/auditoria.js';

let usuarioAtual = null;
let metodoPagamentoSelecionado = 'card';

const dadosPlanos = {
    'Essencial': {
        preco: 'R$ 499/mês',
        total: 'R$ 499,00',
        beneficios: [
            'Manutenção Corretiva Agendada',
            'Relatórios Mensais em PDF',
            'Suporte técnico em até 24h',
            'Gestão de até 5 Máquinas'
        ]
    },
    'Pro Performance': {
        preco: 'R$ 1.299/mês',
        total: 'R$ 1.299,00',
        beneficios: [
            'Manutenção Preditiva com IoT',
            'Dashboard em Tempo Real',
            'Suporte Prioritário 4h',
            'Gestão de até 20 Máquinas',
            'Análise de Vibração Inclusa'
        ]
    },
    'Enterprise': {
        preco: 'Sob Consulta',
        total: 'Personalizado',
        beneficios: [
            'Gestão de Parque Industrial Ilimitado',
            'Consultoria Técnica Dedicada',
            'Integração total via API',
            'Treinamento de Equipe In-loco'
        ]
    }
};

// Alterna entre as abas de pagamento (Cartão, PIX, Boleto)
function inicializarAbasPagamento() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const contents = {
        'card': document.getElementById('paymentCardContent'),
        'pix': document.getElementById('paymentPixContent'),
        'boleto': document.getElementById('paymentBoletoContent')
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            Object.values(contents).forEach(c => c?.classList.remove('active'));

            btn.classList.add('active');
            metodoPagamentoSelecionado = btn.dataset.method;
            if (contents[metodoPagamentoSelecionado]) {
                contents[metodoPagamentoSelecionado].classList.add('active');
            }

            // Ativa/Desativa obrigatoriedade dos campos de cartão
            const camposCartao = contents['card']?.querySelectorAll('input');
            camposCartao?.forEach(input => {
                if (metodoPagamentoSelecionado === 'card') {
                    input.setAttribute('required', 'required');
                } else {
                    input.removeAttribute('required');
                }
            });
        });
    });
}

// Carrega as informações do plano selecionado na interface
function carregarResumoPlano() {
    const urlParams = new URLSearchParams(window.location.search);
    const plano = urlParams.get('plano') || localStorage.getItem('planoSelecionado') || 'Pro Performance';
    
    const info = dadosPlanos[plano] || dadosPlanos['Pro Performance'];

    const titleEl = document.getElementById('checkoutPlanTitle');
    const priceEl = document.getElementById('checkoutPlanPrice');
    const totalEl = document.getElementById('checkoutTotalPrice');
    const listEl = document.getElementById('checkoutBenefitsList');

    if (titleEl) titleEl.textContent = plano;
    if (priceEl) priceEl.innerHTML = info.preco;
    if (totalEl) totalEl.textContent = info.total;

    if (listEl) {
        listEl.innerHTML = info.beneficios
            .map(item => `<li>${item}</li>`)
            .join('');
    }

    return plano;
}

// Preenche dados do usuário se estiver logado no Firebase
async function preencherDadosUsuario(user) {
    if (!user) return;
    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        if (snap.exists()) {
            const data = snap.val();
            if (data.nome) document.getElementById('fullName').value = data.nome;
            if (data.email) document.getElementById('email').value = data.email;
            if (data.cpf || data.cnpj) document.getElementById('docNumber').value = data.cpf || data.cnpj;
            if (data.telefone) document.getElementById('phone').value = data.telefone;
        }
    } catch (err) {
        console.error('Erro ao buscar dados cadastrais:', err);
    }
}

// Processa o envio do formulário de assinatura
function configurarEnvioFormulario(nomePlano) {
    const form = document.getElementById('subscriptionForm');
    const btnSubmit = document.getElementById('submitSubscriptionBtn');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Processando Assinatura...';
        }

        const payloadAssinatura = {
            plano: nomePlano,
            metodoPagamento: metodoPagamentoSelecionado,
            cliente: {
                nome: document.getElementById('fullName').value,
                doc: document.getElementById('docNumber').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('phone').value,
                cep: document.getElementById('zipCode').value,
                cidade: document.getElementById('city').value,
                uf: document.getElementById('state').value
            },
            status: 'Ativa',
            dataCriacao: Date.now()
        };

        try {
            if (usuarioAtual) {
                await update(ref(db, `usuarios/${usuarioAtual.uid}`), {
                    planoAdquirido: nomePlano,
                    statusAssinatura: 'Ativa',
                    dadosAssinatura: payloadAssinatura
                });
                await registrarAuditoria('Assinatura Concluída', `Assinatura do plano ${nomePlano} efetuada via ${metodoPagamentoSelecionado}.`, 'info');
            }

            alert(`🎉 Parabéns! Sua assinatura do ${nomePlano} foi processada com sucesso!`);
            window.location.href = '../index.html';

        } catch (erro) {
            console.error('Erro ao finalizar assinatura:', erro);
            alert('Não foi possível concluir a assinatura. Verifique sua conexão e tente novamente.');
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Confirmar e Ativar Assinatura';
            }
        }
    });
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    const planoAtual = carregarResumoPlano();
    inicializarAbasPagamento();
    configurarEnvioFormulario(planoAtual);

    onAuthStateChanged(auth, (user) => {
        usuarioAtual = user;
        if (user) preencherDadosUsuario(user);
    });
});