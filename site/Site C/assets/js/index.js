document.addEventListener("DOMContentLoaded", () => {
    // 1. Mensagem de Boas-Vindas Personalizada na Hero Section
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const heroSubtitulo = document.querySelector(".hero p");

    if (usuarioLogado && heroSubtitulo) {
        heroSubtitulo.textContent = `Olá, ${usuarioLogado.nome}! Seja bem-vindo de volta à GeTech. Soluções completas e suporte técnico ao seu alcance.`;
    }

    // 2. Animação de entrada suave dos cards ao rolar a página
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const cardsAnimados = document.querySelectorAll(".card, .card-sobre, .topico-item");
    cardsAnimados.forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        observer.observe(card);
    });

    // 3. Estrutura de dados e lógica do Modal Interativo para o "Sobre Nós"
    const dadosTopicos = {
        multissetorial: {
            titulo: "Atuação Multissetorial",
            descricao: "Atendimento especializado para diversas áreas da indústria nacional.",
            detalhes: `
                <p>Nossa equipe conta com conhecimento técnico adaptado às demandas específicas dos seguintes segmentos:</p>
                <ul>
                    <li><strong>Setor Automotivo:</strong> Manutenção de robôs, esteiras e células automatizadas.</li>
                    <li><strong>Setor Alimentício:</strong> Higienização técnica e conformidade com normas sanitárias.</li>
                    <li><strong>Setor Metalúrgico:</strong> Usinagem, prensas pesadas e conformação.</li>
                    <li><strong>Setor Agrícola:</strong> Manutenção de maquinário pesado de campo e processamento.</li>
                </ul>`
        },
        preventiva: {
            titulo: "Manutenção Preventiva",
            descricao: "Foco em evitar paradas não planejadas e maximizar a vida útil das máquinas.",
            detalhes: `
                <p>Reduza custos com paradas repentinas através de cronogramas inteligentes de manutenção:</p>
                <ul>
                    <li><strong>Planos Customizados:</strong> Inspeções periódicas com base em horas de operação.</li>
                    <li><strong>Análise Preditiva:</strong> Termografia, medição de vibração e análise de óleos.</li>
                    <li><strong>Troca Programada:</strong> Substituição prévia de componentes com desgaste natural.</li>
                </ul>`
        },
        inteligente: {
            titulo: "Suporte Inteligente",
            descricao: "Assistente virtual exclusivo para apoio técnico rápido e triagem de dúvidas.",
            detalhes: `
                <p>Agilidade máxima no atendimento e na solução de problemas do dia a dia:</p>
                <ul>
                    <li><strong>Atendimento 24/7:</strong> Nosso ChatBot exclusivo para triagem imediata.</li>
                    <li><strong>Acesso a Manuais:</strong> Repositório técnico com documentações de máquinas.</li>
                    <li><strong>Encaminhamento Rápido:</strong> Conexão direta com nossos engenheiros de plantão para casos críticos.</li>
                </ul>`
        }
    };

    const modal = document.getElementById("modalSobre");
    const modalTitulo = document.getElementById("modalTitulo");
    const modalDescricao = document.getElementById("modalDescricao");
    const modalDetalhes = document.getElementById("modalDetalhes");
    const btnFechar = document.getElementById("fecharModal");

    // Evento de clique nos tópicos interativos
    document.querySelectorAll(".topico-item.clicavel").forEach(card => {
        card.addEventListener("click", () => {
            const chave = card.getAttribute("data-topico");
            const info = dadosTopicos[chave];

            if (info) {
                modalTitulo.textContent = info.titulo;
                modalDescricao.textContent = info.descricao;
                modalDetalhes.innerHTML = info.detalhes;
                modal.style.display = "flex";
            }
        });
    });

    // Funções para fechar o modal
    const fecharModal = () => {
        if (modal) modal.style.display = "none";
    };

    if (btnFechar) btnFechar.addEventListener("click", fecharModal);

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) fecharModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && modal.style.display === "flex") {
            fecharModal();
        }
    });
});