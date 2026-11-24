import { auth, ambienteTeste, appDemo, chaveDemo } from './firebase-config.js';
import {
    browserSessionPersistence, createUserWithEmailAndPassword, getAuth,
    setPersistence, signInWithEmailAndPassword, signOut
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

const botao = document.getElementById('loginLivre');
const status = document.getElementById('loginLivreStatus');

async function iniciarDemo() {
    const app = appDemo();
    const authDemo = getAuth(app);
    await authDemo.authStateReady();
    if (authDemo.currentUser && authDemo.currentUser.uid === sessionStorage.getItem(chaveDemo)) return;
    await setPersistence(authDemo, browserSessionPersistence);
    const email = `getech-demo-${crypto.randomUUID().replaceAll('-', '')}@demo.getech.test`;
    const { user } = await createUserWithEmailAndPassword(authDemo, email, crypto.randomUUID());
    try {
        await set(ref(getDatabase(app), `ambientesDemo/${user.uid}/usuarios/${user.uid}`), {
            email,
            nome: 'Gestor de demonstração',
            tipo: 'gestor'
        });
        sessionStorage.setItem(chaveDemo, user.uid);
    } catch (erro) {
        await user.delete().catch(() => signOut(authDemo));
        throw erro;
    }
}

if (botao && status) {
    botao.onclick = async () => {
        if (botao.disabled) return;
        botao.disabled = true;
        status.textContent = 'Preparando o ERP de demonstração…';
        try {
            if (ambienteTeste) {
                await signInWithEmailAndPassword(auth, 'gestor@demo.getech.test', 'getech-demo-local');
            } else {
                await iniciarDemo();
            }
            location.replace(botao.dataset.destino);
        } catch (erro) {
            console.error('Login livre indisponível.', erro.code);
            status.textContent = 'Não foi possível abrir o ERP de demonstração. Tente novamente.';
            botao.disabled = false;
        }
    };
}
