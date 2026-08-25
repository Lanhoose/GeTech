document.addEventListener("DOMContentLoaded", function () {
    // 1. Obtém os dados do utilizador logado no localStorage
    function lerSessaoSalva(chave) {
        try {
            return JSON.parse(localStorage.getItem(chave));
        } catch (erro) {
            return null; // Valor inválido/corrompido no localStorage não deve travar o script
        }
    }
    const sessao = lerSessaoSalva('sessaoGeTech') || lerSessaoSalva('usuarioLogado');

    // Elementos da interface
    const itensGestor = document.querySelectorAll('.restrito.gestor');
    const itensPatrocinador = document.querySelectorAll('.restrito.patrocinador');
    const avatarImg = document.getElementById('avatarUsuario'); // <--- CAPTURA O AVATAR
    const botaoSairContainer = document.getElementById('menuSair');
    const botaoSairLink = document.getElementById('btnSair');

    // Valida se a sessão está realmente ativa
    const estaLogado = sessao && (sessao.loginAtivo || sessao.email || sessao.perfil || sessao.tipo);

    // 2. Aplica regras de exibição com base na sessão
    if (estaLogado) {
        const perfil = (sessao.perfil || sessao.tipo || '').toLowerCase();

        // --- NOVO: EXIBE E ATUALIZA A FOTO DE PERFIL ---
        if (avatarImg) {
            avatarImg.src = sessao.foto || sessao.avatar || "../assets/img/perfil.jpg";
            avatarImg.style.display = 'inline-block';
        }

        // Se for gestor, vê tudo
        if (perfil === 'gestor') {
            itensGestor.forEach(el => el.classList.remove('escondido'));
            itensPatrocinador.forEach(el => el.classList.remove('escondido'));
        } 
        // Se for patrocinador, vê apenas abas liberadas para patrocinador
        else if (perfil === 'patrocinador') {
            itensGestor.forEach(el => el.classList.add('escondido'));
            itensPatrocinador.forEach(el => el.classList.remove('escondido'));
        } 
        // Cliente ou outro perfil comum
        else {
            itensGestor.forEach(el => el.classList.add('escondido'));
            itensPatrocinador.forEach(el => el.classList.add('escondido'));
        }

        // Exibe botão sair
        if (botaoSairContainer) botaoSairContainer.style.display = 'inline-block';

    } else {
        // Sem login: mantém o ícone visível com uma foto padrão (linkando para cadastro/login),
        // em vez de escondê-lo por completo — só oculta o conteúdo restrito e o botão "Sair".
        if (avatarImg) {
            avatarImg.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            avatarImg.style.display = 'inline-block';
        }
        if (botaoSairContainer) botaoSairContainer.style.display = 'none';
        itensGestor.forEach(el => el.classList.add('escondido'));
        itensPatrocinador.forEach(el => el.classList.add('escondido'));
    }

    // 3. Bloqueio Direto de URL na página de patrocinadores
    if (window.location.pathname.includes("patrocinadores.html")) {
        const perfilAtivo = estaLogado ? (sessao.perfil || sessao.tipo || '').toLowerCase() : null;
        
        if (perfilAtivo !== 'gestor' && perfilAtivo !== 'patrocinador') {
            alert("⚠️ Acesso restrito! Faça login como Patrocinador ou Gestor para continuar.");
            window.location.href = "login.html";
        }
    }

    // 4. Função do Botão "Sair"
    if (botaoSairLink) {
        botaoSairLink.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("sessaoGeTech");
            localStorage.removeItem("usuarioLogado");
            alert("Sessão encerrada com sucesso!");
            window.location.href = "login.html";
        });
    }
});