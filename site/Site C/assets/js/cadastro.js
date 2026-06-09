function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

document.getElementById('foto').addEventListener('change', function() {
    const arquivo = this.files[0];
    const textoFeedback = document.getElementById('nome-arquivo');
    
    if (arquivo) {
        textoFeedback.textContent = `▶ Ficheiro selecionado: ${arquivo.name}`;
        textoFeedback.style.color = "var(--azul-industrial)";
    } else {
        textoFeedback.textContent = "Nenhuma foto selecionada";
        textoFeedback.style.color = "#666";
    }
});

document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    
    const tipoUsuario = document.getElementById('tipo_usuario').value; 
    const nomeUsuario = document.getElementById('nome').value;
    const emailUsuario = document.getElementById('email').value.trim().toLowerCase();
    const s1 = document.getElementById('senha').value;
    const s2 = document.getElementById('senha2').value;
    const fotoInput = document.getElementById('foto').files[0];

    if (s1 !== s2) {
        alert("⚠️ As senhas não conferem. Tente novamente.");
        return;
    }

    let fotoBase64 = "";
    if (fotoInput) {
        try {
            fotoBase64 = await converterParaBase64(fotoInput);
        } catch (erro) {
            alert("⚠️ Erro ao processar a imagem. Tenta outra foto.");
            return;
        }
    } else {
        fotoBase64 = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }

    let usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosGeTech')) || [];

    const usuarioExiste = usuariosCadastrados.some(user => user.email === emailUsuario);
    if (usuarioExiste) {
        alert("⚠️ Este e-mail já está cadastrado!");
        return;
    }

    const novoUsuario = {
        nome: nomeUsuario,
        email: emailUsuario,
        senha: s1,
        perfil: tipoUsuario,
        foto: fotoBase64
    };
    usuariosCadastrados.push(novoUsuario);
    localStorage.setItem('usuariosGeTech', JSON.stringify(usuariosCadastrados));

    const dadosSessao = {
        nome: nomeUsuario,
        perfil: tipoUsuario,
        foto: fotoBase64,
        loginAtivo: true
    };
    localStorage.setItem('sessaoGeTech', JSON.stringify(dadosSessao));

    if (tipoUsuario === 'gestor') {
        alert("✅ Perfil GESTOR cadastrado com sucesso! Redirecionando para o Painel...");
        window.location.href = "sistema.html"; 
    } else {
        alert("✅ Cadastro de CLIENTE concluído! Redirecionando para a Home...");
        window.location.href = "index.html";
    }
});