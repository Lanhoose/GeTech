// ===========================================================================
// integracao.js
// Painel de integrações — acessível a usuários logados com perfil de gestor,
// cliente, patrocinador ou usuario (mesma regra de protecao-gestor.js).
// A restrição exclusiva a gestor fica apenas nas páginas da pasta app.
// ===========================================================================

import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const BASE_URL = window.location.origin + "/GeTech";
const DESTINO_LOGIN = `${BASE_URL}/site/public/pages/login.html`;
const DESTINO_SITE_C = `${BASE_URL}/site/Site C/pages/index.html`;

// Tipos de perfil que podem abrir esta página (mesma lista de protecao-gestor.js).
const TIPOS_COM_ACESSO = ["gestor", "cliente", "patrocinador", "usuario"];

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

function bloquearAcesso(mensagem, destino) {
    alert(mensagem);
    window.location.href = destino;
}

// ==========================================================================
// VERIFICAÇÃO DE ACESSO (usuário logado com perfil permitido) + RENDERIZAÇÃO
// ==========================================================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        bloquearAcesso("Faça login para acessar esta página.", DESTINO_LOGIN);
        return;
    }

    try {
        const snap = await get(ref(db, `usuarios/${user.uid}`));
        const perfil = snap.exists() ? snap.val() : {};
        const tipo = String(perfil.tipo || "").toLowerCase();

        if (!TIPOS_COM_ACESSO.includes(tipo)) {
            bloquearAcesso("Seu perfil não tem acesso a esta página.", DESTINO_SITE_C);
            return;
        }
    } catch (erro) {
        console.error("[Integração] Erro ao verificar o perfil do usuário:", erro);
        bloquearAcesso("Não foi possível verificar seu perfil de acesso. Tente novamente.", DESTINO_SITE_C);
        return;
    }

    // Perfil com acesso confirmado: libera a renderização dos parceiros.
    renderPartners(mockPartnersData);
});

document.addEventListener("DOMContentLoaded", mostrarCarregando);