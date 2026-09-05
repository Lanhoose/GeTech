import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { ref, get, push, set, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

let usuarioAtual = null;
let perfilAtual = {};

const postsIniciais = [
    {
        title: 'Como configurar as variáveis de ambiente no Node.js',
        type: '📚 Tutorial',
        date: '22/05/2026',
        desc: 'Um guia rápido para proteger suas chaves de API utilizando o pacote dotenv. Nunca subam o arquivo .env diretamente para o GitHub de vocês, adicionem sempre no .gitignore!',
        authorName: 'Ana Clara Costa',
        authorEmail: 'anaclara.dev@getech.com.br'
    },
    {
        title: 'Erro bizarro ao rodar containers Docker em lote',
        type: '❓ Dúvida',
        date: '20/05/2026',
        desc: "Alguém da equipe de infraestrutura já passou pelo erro 'port is already allocated' no Windows WSL2 mesmo depois de dar um down em todos os containers ativos? Se sim, qual comando resolveu sem precisar reiniciar a máquina?",
        authorName: 'Lucas Ramos',
        authorEmail: 'lucas.ramos@getech.com.br'
    },
    {
        title: 'Lançamento oficial do ECMAScript 2026',
        type: '🚀 Notícia',
        date: '18/05/2026',
        desc: 'As novas propostas aprovadas trazem melhorias absurdas para a manipulação de objetos assíncronos e novos helpers nativos para arrays. Vale a pena dar uma conferida na documentação oficial.',
        authorName: 'Mariana Souza',
        authorEmail: 'mari.souza@getech.com.br'
    }
];

function escaparHTML(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function carregarPerfil(user) {
    if (!user) return {};
    const snap = await get(ref(db, `usuarios/${user.uid}`));
    perfilAtual = snap.exists() ? snap.val() : {};
    return perfilAtual;
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    const autor = post.authorName || 'Desenvolvedor GeTech';
    card.innerHTML = `
        <div class="post-meta">
            <span class="post-badge">${escaparHTML(post.type)}</span>
            <span class="post-date">${escaparHTML(post.date)}</span>
        </div>
        <h3 class="post-title">${escaparHTML(post.title)}</h3>
        <p class="post-desc">${escaparHTML(post.desc).replace(/\n/g, '<br>')}</p>
        <div class="post-author-box">
            <div class="author-avatar">${escaparHTML(autor.charAt(0).toUpperCase())}</div>
            <div class="author-info">
                <span class="author-name">${escaparHTML(autor)}</span>
                <span class="author-email">${escaparHTML(post.authorEmail || '')}</span>
            </div>
        </div>
    `;
    return card;
}

function renderizarPosts(posts) {
    const feedContainer = document.getElementById('feedContainer');
    if (!feedContainer) return;
    feedContainer.innerHTML = '';

    posts.forEach(post => feedContainer.appendChild(createPostCard(post)));
}

function abrirModal() {
    document.getElementById('postModal')?.style.setProperty('display', 'flex');
}

function fecharModal() {
    const modal = document.getElementById('postModal');
    if (modal) modal.style.display = 'none';
}

async function carregarFeed() {
    const feedContainer = document.getElementById('feedContainer');
    if (!feedContainer) return;

    renderizarPosts(postsIniciais);

    onValue(ref(db, 'postsBlog'), (snapshot) => {
        const dados = snapshot.val() || {};
        const postsFirebase = Object.entries(dados)
            .map(([id, post]) => ({ id, ...post }))
            .sort((a, b) => Number(b.criadoEm || 0) - Number(a.criadoEm || 0));

        renderizarPosts([...postsFirebase, ...postsIniciais]);
    });
}

async function publicarPost(evento) {
    evento.preventDefault();
    const form = evento.currentTarget;
    if (!usuarioAtual) {
        alert('Faça login para publicar no blog.');
        return;
    }

    const title = document.getElementById('machineName')?.value.trim();
    const type = document.getElementById('type')?.value;
    const desc = document.getElementById('description')?.value.trim();
    if (!title || !type || !desc) return;

    const autorNome = perfilAtual.nome || usuarioAtual.displayName || usuarioAtual.email?.split('@')[0] || 'Desenvolvedor GeTech';
    const autorEmail = usuarioAtual.email || perfilAtual.email || '';
    const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    try {
        const novaRef = push(ref(db, 'postsBlog'));
        await set(novaRef, {
            title,
            type,
            date: currentDate,
            desc,
            authorName: autorNome,
            authorEmail: autorEmail,
            criadoEm: serverTimestamp(),
            criadoPor: usuarioAtual.uid
        });

        form.reset();
        fecharModal();
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível publicar o post no Firebase.');
    }
}

window.abrirModalPost = abrirModal;
window.fecharModalPost = fecharModal;

onAuthStateChanged(auth, async (user) => {
    usuarioAtual = user;
    if (user) await carregarPerfil(user);
    await carregarFeed();
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('openModalBtn')?.addEventListener('click', abrirModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', fecharModal);
    document.getElementById('maintenanceForm')?.addEventListener('submit', publicarPost);

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('postModal');
        if (e.target === modal) fecharModal();
    });
});
