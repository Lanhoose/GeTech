// ==========================================
// MÁSCARAS (sem alteração)
// ==========================================
function formatarTelefone(valor) {
    valor = valor.replace(/\D/g, "");
    if (valor.length > 10) {
        return valor.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else {
        return valor.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }
}

function formatarDocumento(valor) {
    valor = valor.replace(/\D/g, "");
    if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        return valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
        valor = valor.substring(0, 14);
        valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
        return valor.replace(/(\d{4})(\d)/, "$1-$2");
    }
}

document.getElementById('tel').addEventListener('input', function(e) {
    let numeros = e.target.value.replace(/\D/g, "").substring(0, 11);
    e.target.value = formatarTelefone(numeros);
});

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

// ==========================================
// CADASTRO — Firebase Auth + Realtime Database
// ==========================================
import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { registrarAuditoria } from "../../app/assets/js/auditoria.js";

document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const tipoUsuario = document.getElementById('tipo_usuario').value;
    const nomeUsuario = document.getElementById('nome').value;
    const emailUsuario = document.getElementById('email').value.trim().toLowerCase();
    const doc = document.getElementById('doc').value;
    const tel = document.getElementById('tel').value;
    const setor = document.getElementById('setor').value;
    const s1 = document.getElementById('senha').value;
    const s2 = document.getElementById('senha2').value;
    const fotoInput = document.getElementById('foto').files[0];

    if (s1 !== s2) {
        alert("⚠️ As senhas não conferem. Tente novamente.");
        return;
    }
    if (s1.length < 6) {
        alert("⚠️ A senha precisa ter pelo menos 6 caracteres (exigência do Firebase).");
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

    if (submitBtn) submitBtn.disabled = true;

    try {
        const cred = await createUserWithEmailAndPassword(auth, emailUsuario, s1);
        const uid = cred.user.uid;

        await set(ref(db, `usuarios/${uid}`), {
            nome: nomeUsuario,
            email: emailUsuario,
            documento: doc,
            telefone: tel,
            setor: setor,
            tipo: tipoUsuario,
            foto: fotoBase64
        });
        await registrarAuditoria('Cadastro: usuário criado', `Perfil ${tipoUsuario} criado para ${nomeUsuario} (${emailUsuario}).`, 'info');

        if (tipoUsuario === 'gestor') {
            alert("✅ Perfil GESTOR cadastrado com sucesso! Redirecionando para o Painel...");
            window.location.href = "sistema.html";
        } else if (tipoUsuario === 'patrocinador') {
            alert("✅ Perfil PATROCINADOR cadastrado com sucesso! Redirecionando para o seu Painel...");
            window.location.href = "patrocinadores.html";
        } else {
            alert("✅ Cadastro de CLIENTE concluído! Redirecionando para a Home...");
            window.location.href = "index.html";
        }
    } catch (erro) {
        console.error("Erro no cadastro:", erro);
        if (erro.code === 'auth/email-already-in-use') {
            alert("⚠️ Este e-mail já está cadastrado!");
        } else if (erro.code === 'auth/invalid-email') {
            alert("⚠️ E-mail inválido.");
        } else if (erro.code === 'auth/weak-password') {
            alert("⚠️ Senha muito fraca. Use pelo menos 6 caracteres.");
        } else {
            alert("⚠️ Não foi possível concluir o cadastro. Tente novamente.");
        }
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});