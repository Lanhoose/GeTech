import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { ref, get, update } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

const BASE_URL = window.location.origin + '/GeTech';
let usuarioAtual = null;

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

async function selectPlan(planName) {
    const modal = document.getElementById('planModal');
    const modalPlanName = document.getElementById('modalPlanName');
    const modalBenefitsList = document.getElementById('modalBenefitsList');

    if (modalPlanName) modalPlanName.innerText = planName;
    if (modalBenefitsList) {
        modalBenefitsList.innerHTML = '';
        const beneficios = planosExclusivosInfo[planName] || ['Benefícios padrão do sistema GeTech.'];
        beneficios.forEach(beneficio => {
            const li = document.createElement('li');
            li.innerText = beneficio;
            modalBenefitsList.appendChild(li);
        });
    }
    if (modal) modal.classList.add('active');

    if (!usuarioAtual) {
        console.warn('Plano selecionado apenas visualmente: usuário não autenticado.');
        return;
    }

    try {
        await update(ref(db, `usuarios/${usuarioAtual.uid}`), {
            planoAdquirido: planName,
            planoAtualizadoEm: Date.now()
        });
        console.log(`Plano ${planName} salvo no Firebase.`);
    } catch (erro) {
        console.error('Erro ao salvar plano:', erro);
        alert('O plano foi selecionado, mas não foi possível salvar a escolha no Firebase.');
    }
}
window.selectPlan = selectPlan;

async function carregarPlanoAtual(user) {
    if (!user) return;
    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const perfil = snap.exists() ? snap.val() : {};
        const plano = perfil.planoAdquirido;
        if (plano) document.body.dataset.planoAtual = plano;
    } catch (erro) {
        console.error('Erro ao carregar plano:', erro);
    }
}

onAuthStateChanged(auth, async (user) => {
    usuarioAtual = user;
    if (user) await carregarPlanoAtual(user);
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('planModal');
    const closeModal = document.getElementById('closeModal');

    closeModal?.addEventListener('click', () => modal?.classList.remove('active'));
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    document.querySelectorAll('.plan-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.4s ease';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
});
