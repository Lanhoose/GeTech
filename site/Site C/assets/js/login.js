document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const usuarioInput = document.getElementById('usuario').value.trim().toLowerCase();
    const senhaInput = document.getElementById('senha').value;

    // 1. Busca a lista de usuários cadastrados no localStorage
    const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosGeTech')) || [];

    // 2. Procura por um usuário onde o e-mail E a senha coincidam
    const usuarioEncontrado = usuariosCadastrados.find(user => user.email === usuarioInput && user.senha === senhaInput);

    if (!usuarioEncontrado) {
        alert("❌ E-mail ou senha incorretos. Tente novamente.");
        return;
    }

    // 3. Se achou, limpa qualquer sessão antiga
    localStorage.removeItem('sessaoGeTech');

    // 4. Grava a nova sessão com os dados REAIS obtidos do cadastro
// ... (código anterior do login que procura o utilizador encontrado)

// 4. Grava a nova sessão com os dados REAIS obtidos do cadastro (incluindo a foto)
const dadosUsuario = {
    nome: usuarioEncontrado.nome,
    perfil: usuarioEncontrado.perfil,
    foto: usuarioEncontrado.foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Usa a foto do cadastro ou a padrão
    loginAtivo: true
};
localStorage.setItem('sessaoGeTech', JSON.stringify(dadosUsuario));

// ... (resto do código de redirecionamento do login)

    // 5. Redirecionamento baseado no perfil real do cadastro
    if (usuarioEncontrado.perfil === 'gestor') {
        alert(`✅ Bem-vindo, Gestor ${usuarioEncontrado.nome}! Entrando no sistema administrativo...`);
        window.location.href = "sistema.html";
    } else if (usuarioEncontrado.perfil === 'patrocinador') {
        alert(`✅ Bem-vindo, ${usuarioEncontrado.nome}! Entrando no painel de patrocinador...`);
        window.location.href = "patrocinadores.html";
    } else {
        alert(`✅ Login efetuado com sucesso! Olá, ${usuarioEncontrado.nome}.`);
        window.location.href = "index.html";
    }
});