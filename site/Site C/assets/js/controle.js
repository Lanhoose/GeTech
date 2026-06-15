document.addEventListener("DOMContentLoaded", function () {
    // Busca os dados criados no cadastro ou login
    const sessao = JSON.parse(localStorage.getItem('sessaoGeTech'));

    // Seleciona as abas de Orçamentos, Mensagens e Sistema
    const itensRestritosGestor = document.querySelectorAll('.restrito.gestor');

    // ==========================================
    // TRECHO DA FOTO DE PERFIL (ADICIONADO AQUI)
    // ==========================================
    if (sessao && sessao.loginAtivo && sessao.foto) {
        const imgAvatar = document.getElementById('avatarUsuario');
        if (imgAvatar) {
            imgAvatar.src = sessao.foto; // Atribui a string Base64 diretamente ao src
            imgAvatar.style.display = 'block'; // Mostra a imagem
        }
    }
    // ==========================================

    // Lógica que você já tinha para controlar o acesso do Gestor/Cliente
    if (sessao && sessao.loginAtivo) {
        
        if (sessao.perfil === 'cliente') {
            // Se for cliente, adiciona a classe que esconde as abas do gestor
            itensRestritosGestor.forEach(elemento => {
                elemento.classList.add('escondido');
            });
        } else if (sessao.perfil === 'gestor') {
            // Se for gestor, garante que elas apareçam
            itensRestritosGestor.forEach(elemento => {
                elemento.classList.remove('escondido');
            });
        }

    } else {
        // Se ninguém estiver logado ainda, esconde por padrão
        itensRestritosGestor.forEach(elemento => {
            elemento.classList.add('escondido');
        });
    }

    // =================================================================
    // ADICIONADO APENAS A LOGICA PRO BOTAO SAIR APARECER SE LOGADO
    // =================================================================
    const botaoSairContainer = document.getElementById('menuSair');
    const botaoSairLink = document.getElementById('btnSair'); // CORRIGIDO: Espaço removido aqui!

    // Controla se o botão deve aparecer ou sumir
    if (sessao && sessao.loginAtivo) {
        if (botaoSairContainer) botaoSairContainer.style.display = 'inline-block';
    } else {
        if (botaoSairContainer) botaoSairContainer.style.display = 'none';
    }

    // Ação do clique para deslogar
    if (botaoSairLink) {
        botaoSairLink.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("sessaoGeTech");
            alert("Sessão encerrada com sucesso!");
            window.location.href = "login.html";
        });
    }
    // =================================================================
});