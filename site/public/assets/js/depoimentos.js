import { auth, db } from '../../../Site C/assets/js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { ref, push, set, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

const overlay = document.getElementById('form-overlay');
const form = document.getElementById('form-depoimento');
const botaoSalvar = document.getElementById('btn-salvar');
const grid = document.getElementById('grid-depoimentos');
const status = document.getElementById('depoimentos-status');
const depoimentosRef = ref(db, 'depoimentos');
let pararLeitura;

function criarCard({ nome, cargo, texto, nota }) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.depoimento = '';
    card.innerHTML = `
        <div class="card-header">
            <div class="stars"></div>
            <span class="quote-icon">❞</span>
        </div>
        <p></p>
        <div class="card-footer">
            <div class="avatar"></div>
            <div class="user-info"><strong></strong><small></small></div>
        </div>`;

    const partes = nome.trim().split(/\s+/);
    const primeira = partes[0].charAt(0);
    const ultima = partes.length > 1 ? partes.at(-1).charAt(0) : '';
    card.querySelector('.avatar').textContent = (primeira + ultima).toUpperCase();
    card.querySelector('.stars').textContent = nota;
    card.querySelector('p').textContent = `"${texto}"`;
    card.querySelector('strong').textContent = nome;
    card.querySelector('small').textContent = cargo;
    return card;
}

function renderizarDepoimentos(depoimentos) {
    grid.querySelectorAll('[data-depoimento]').forEach(card => card.remove());
    const cards = document.createDocumentFragment();
    depoimentos
        .sort((a, b) => b.criadoEm - a.criadoEm)
        .forEach(depoimento => cards.appendChild(criarCard(depoimento)));
    grid.prepend(cards);
}

onAuthStateChanged(auth, (user) => {
    pararLeitura?.();
    renderizarDepoimentos([]);
    status.textContent = '';
    if (!user) return;

    pararLeitura = onValue(depoimentosRef, snapshot => {
        renderizarDepoimentos(Object.values(snapshot.val() || {}));
    }, erro => {
        console.error('Erro ao carregar depoimentos.', erro);
        status.textContent = 'Não foi possível carregar os depoimentos enviados.';
    });
});

document.getElementById('btn-abrir-form').onclick = () => overlay.classList.remove('hidden');
document.getElementById('btn-cancelar').onclick = () => overlay.classList.add('hidden');
overlay.onclick = (evento) => {
    if (evento.target === overlay) overlay.classList.add('hidden');
};

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (botaoSalvar.disabled) return;
    const user = auth.currentUser;
    if (!user) {
        alert('Faça login para enviar um depoimento.');
        return;
    }

    const nome = document.getElementById('nome').value.trim();
    const cargo = document.getElementById('cargo').value.trim();
    const texto = document.getElementById('texto').value.trim();
    const nota = document.getElementById('nota').value;
    if (!nome || !cargo || !texto) {
        alert('Preencha o nome, o cargo e o depoimento.');
        return;
    }

    botaoSalvar.disabled = true;
    try {
        await set(push(ref(db, 'depoimentosPendentes')), {
            nome, cargo, texto, nota,
            criadoEm: serverTimestamp(),
            criadoPor: user.uid
        });
        form.reset();
        overlay.classList.add('hidden');
        status.textContent = 'Depoimento enviado. Ele aparecerá após a aprovação do gestor.';
    } catch (erro) {
        console.error('Erro ao salvar depoimento.', erro);
        alert(erro.code === 'PERMISSION_DENIED'
            ? 'O banco recusou o depoimento. Verifique as permissões com o administrador.'
            : 'Não foi possível salvar o depoimento. Tente novamente.');
    } finally {
        botaoSalvar.disabled = false;
    }
});
