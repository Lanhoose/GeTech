import { auth, ambienteTeste } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const botao = document.getElementById('loginLivre');
const status = document.getElementById('loginLivreStatus');

if (ambienteTeste && botao && status) {
    status.textContent = 'Ambiente de teste local';
    botao.onclick = async () => {
        botao.disabled = true;
        try {
            await signInWithEmailAndPassword(auth, 'gestor@demo.getech.test', 'getech-demo-local');
            location.replace(botao.dataset.destino);
        } catch (erro) {
            console.error('Login livre local indisponível.', erro.code);
            status.textContent = 'Não foi possível entrar. Confira se o ambiente de teste está em execução.';
            botao.disabled = false;
        }
    };
}
