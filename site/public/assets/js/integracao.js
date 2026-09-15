// ===========================================================================
// integracao.js
// Painel de integrações — restrito a usuários com tipo === "gestor".
//
// A verificação antiga lia localStorage.getItem('sessaoGeTech'), um resquício
// do sistema de login por localStorage que o projeto usava antes de migrar
// para o Firebase. Como nada no projeto grava mais essa chave (login.js e
// cadastro.js usam Firebase Authentication + Realtime Database), a condição
// nunca era satisfeita e QUALQUER usuário — inclusive um gestor de verdade
// logado — era barrado. A verificação foi trocada pelo mesmo padrão usado
// nos outros módulos: onAuthStateChanged + usuarios/{uid}/tipo.
// ===========================================================================

import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const BASE_URL = window.location.origin + "/GeTech";

const mockPartnersData = [
    {
        nome: "Logistock",
        descricao: "Soluções de logística e transporte.",
        url: "https://jvap-bit.github.io/sistema_ERP/",
        destaque: true,
        beneficios: ["Rastreio em tempo real", "Segurança"]
    },
    {
        nome: "FedEx",
        descricao: "Integração completa de entrega e rastreio.",
        url: "https://www.fedex.com/pt-br/home.html",
        destaque: false,
        beneficios: ["Rastreio em tempo real", "Segurança"]
    },
    {
        nome: "Tecfag",
        descricao: "Encomenda de maquinas e peças.",
        url: "https://tecfagpersonnalite.com.br/landing",
        destaque: false,
        beneficios: ["Desconto em peças de reposição", "Suporte prioritário"]
    },
    {
        nome: "Mercado Pago",
        descricao: "Processamento de pagamentos seguro.",
        url: "https://www.mercadopago.com.br/",
        destaque: false,
        beneficios: ["Antifraude integrado", "Taxas reduzidas"]
    },
    {
        nome: "Getninjas",
        descricao: "Contratação de mecânicos industriais.",
        url: "https://www.getninjas.com.br/",
        destaque: false,
        beneficios: ["Mecânicos certificados", "Disponibilidade 24h"]
    }
];

function renderPartners(partners) {
    const grid = document.getElementById('partners-grid');
    if (!grid) return;

    grid.innerHTML = '';

    partners.forEach(partner => {
        const card = document.createElement('div');
        card.className = `plan-card ${partner.destaque ? 'featured' : ''}`;

        card.innerHTML = `
            ${partner.destaque ? '<div class="badge">Destaque</div>' : ''}

            <div class="plan-info">
                <h3>${partner.nome}</h3>
                <span class="partner-tag">GeTech Partner</span>
                <p class="partner-desc">${partner.descricao}</p>
                <ul class="partner-benefits">
                    ${partner.beneficios.map(b => `<li>${b}</li>`).join('')}
                </ul>
            </div>

            <button class="connect-btn" onclick="window.open('${partner.url}', '_blank')">Conectar</button>
        `;

        grid.appendChild(card);
    });
}

function mostrarCarregando() {
    const grid = document.getElementById('partners-grid');
    if (grid) grid.innerHTML = '<p>Carregando parceiros integrados...</p>';
}

function bloquearAcesso(mensagem) {
    alert(mensagem);
    window.location.href = `${BASE_URL}/site/Site C/pages/index.html`;
}

// ==========================================================================
// VERIFICAÇÃO DE ACESSO (gestor) + RENDERIZAÇÃO DOS PARCEIROS
// ==========================================================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        bloquearAcesso("Acesso restrito. Apenas gestores podem acessar este painel.");
        return;
    }

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const perfil = snap.exists() ? snap.val() : {};

        if ((perfil.tipo || '').toLowerCase() !== 'gestor') {
            bloquearAcesso("Acesso restrito. Apenas gestores podem acessar este painel.");
            return;
        }
    } catch (erro) {
        console.error("[Integração] Erro ao verificar o perfil do usuário:", erro);
        bloquearAcesso("Não foi possível verificar seu perfil de acesso. Tente novamente.");
        return;
    }

    // Perfil confirmado como gestor: libera a renderização dos parceiros.
    renderPartners(mockPartnersData);
});

document.addEventListener("DOMContentLoaded", mostrarCarregando);