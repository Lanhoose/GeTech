// ==========================================
// FUNÇÕES DE MÁSCARA / FORMATAÇÃO (Regex)
// ==========================================

// Formata Telefone dinamicamente: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
function formatarTelefone(valor) {
    valor = valor.replace(/\D/g, ""); // Remove tudo o que não for número
    
    if (valor.length > 10) {
        // Celular (9 dígitos): (11) 99999-9999
        return valor.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else {
        // Telefone fixo (8 dígitos): (11) 9999-9999
        return valor.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }
}

// Formata CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00)
function formatarDocumento(valor) {
    valor = valor.replace(/\D/g, ""); // Remove tudo o que não for número

    if (valor.length <= 11) {
        // Máscara de CPF
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        return valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
        // Máscara de CNPJ (limita a 14 números)
        valor = valor.substring(0, 14);
        valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
        return valor.replace(/(\d{4})(\d)/, "$1-$2");
    }
}

// ==========================================
// OUVINTES DE EVENTOS (Máscaras em tempo real)
// ==========================================

// Aplica máscara ao digitar no campo de Telefone
document.getElementById('tel').addEventListener('input', function(e) {
    let numeros = e.target.value.replace(/\D/g, "").substring(0, 11);
    e.target.value = formatarTelefone(numeros);
});

// Aplica máscara ao digitar no campo de CPF/CNPJ
document.getElementById('doc').addEventListener('input', function(e) {
    let numeros = e.target.value.replace(/\D/g, "").substring(0, 14);
    e.target.value = formatarDocumento(numeros);
});


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