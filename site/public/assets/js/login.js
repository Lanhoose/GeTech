// =========================
//  CADASTRO
// =========================
function cadastrar() {
    const email   = document.getElementById('cadEmail').value.trim();
    const senha   = document.getElementById('cadSenha').value;
    const msg     = document.getElementById('mensagem-cad');

    msg.innerText = '';

    if (!email || !senha) {
        mostrarMensagem(msg, 'Preencha todos os campos do cadastro!', 'erro');
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem(msg, 'A senha deve ter pelo menos 6 caracteres.', 'erro');
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    if (usuarios.find(u => u.email === email)) {
        mostrarMensagem(msg, 'Este email já está cadastrado!', 'erro');
        return;
    }

    usuarios.push({ email, senha });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    mostrarMensagem(msg, 'Cadastro realizado com sucesso! Faça o login.', 'sucesso');

    document.getElementById('cadEmail').value = '';
    document.getElementById('cadSenha').value = '';

    // Redireciona para a aba de login após 1.5s
    setTimeout(() => {
        switchTab('login', document.querySelectorAll('.tab-btn')[0]);
    }, 1500);
}


// =========================
//  LOGIN
// =========================
function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;
    const msg   = document.getElementById('mensagem');

    msg.innerText = '';

    if (!email || !senha) {
        mostrarMensagem(msg, 'Preencha todos os campos do login!', 'erro');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario  = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
        mostrarMensagem(msg, 'Login realizado com sucesso!', 'sucesso');

        localStorage.setItem('logado', 'true');
        localStorage.setItem('usuarioAtual', usuario.email);

        setTimeout(() => {
            window.location.href = '/site/app/app.html';
        }, 1000);
    } else {
        mostrarMensagem(msg, 'Email ou senha incorretos!', 'erro');
    }
}


// =========================
//  HELPER — exibe mensagem
// =========================
function mostrarMensagem(elemento, texto, tipo) {
    elemento.innerText = texto;
    elemento.style.color = tipo === 'sucesso'
        ? 'var(--accent-green)'
        : '#f87171';
}