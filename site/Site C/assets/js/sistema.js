// Sistema de Manutenção - Firebase compartilhado com todo o Site C
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { ref, push, onValue, get, query, orderByChild } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';

const $ = (id) => document.getElementById(id);
let perfilAtual = null;

function mensagem(el, texto, erro = false) {
  if (!el) return;
  el.textContent = texto;
  el.style.color = erro ? '#ef4444' : 'var(--azul-industrial)';
}

function escapar(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function exibirMaquinas(dados, container) {
  if (!container) return;
  container.innerHTML = '';
  if (!dados || Object.keys(dados).length === 0) {
    container.innerHTML = '<p>Nenhuma máquina encontrada.</p>';
    return;
  }
  Object.entries(dados).forEach(([id, item]) => {
    const card = document.createElement('div');
    card.className = 'card-item';
    card.innerHTML = `<strong>Máquina:</strong> ${escapar(item.nomeMaquina)}<br><strong>Modelo:</strong> ${escapar(item.modeloMaquina)}<br><strong>S/N:</strong> ${escapar(item.numeroDeSerie)}<br><small>ID: ${escapar(id)}</small>`;
    container.appendChild(card);
  });
}

function exibirUsuarios(dados, container) {
  if (!container) return;
  container.innerHTML = '';
  if (!dados || Object.keys(dados).length === 0) {
    container.innerHTML = '<p>Nenhum usuário encontrado.</p>';
    return;
  }
  Object.entries(dados).forEach(([id, item]) => {
    const card = document.createElement('div');
    card.className = 'card-item';
    card.innerHTML = `<strong>Nome:</strong> ${escapar(item.nome || item.nomeUsuario)}<br><strong>Perfil:</strong> ${escapar(item.tipo || item.TipoUsuario)}<br><small>ID: ${escapar(id)}</small>`;
    container.appendChild(card);
  });
}

function exibirOS(dados, container) {
  if (!container) return;
  container.innerHTML = '';
  if (!dados || Object.keys(dados).length === 0) {
    container.innerHTML = '<p>Sem histórico de ordens de serviço.</p>';
    return;
  }
  Object.entries(dados).reverse().forEach(([id, item]) => {
    const card = document.createElement('div');
    card.className = 'card-item';
    card.innerHTML = `<strong>Equipamento:</strong> ${escapar(item.maquinaOs || item.maquinaOS || item.maquina)}<br><strong>Serviço:</strong> ${escapar(item.descricaoOs || item.descricaoOS || item.descricao)}<br><span style="color:var(--azul-industrial);font-weight:bold;">Status: ${escapar(item.statusOs || item.status || 'pendente')}</span><br><small>ID: ${escapar(id)}</small>`;
    container.appendChild(card);
  });
}

function mostrarErroFirebase(prefixo, erro, elemento) {
  console.error(prefixo, erro);
  const codigo = erro?.code || erro?.message || 'erro desconhecido';
  mensagem(elemento, `${prefixo}: ${codigo}`, true);
}

function iniciarListeners() {
  // Listeners em tempo real: qualquer alteração feita pelo app aparece aqui.
  onValue(ref(db, 'maquinas'), snap => exibirMaquinas(snap.val(), $('listaMaquina')), err => mostrarErroFirebase('Erro ao conectar às máquinas', err, $('dadosmaquina')));
  onValue(ref(db, 'ordensServico'), snap => exibirOS(snap.val(), $('listaOS')), err => mostrarErroFirebase('Erro ao conectar às ordens de serviço', err, $('ordem_servico')));
  onValue(ref(db, 'usuarios'), snap => {
    const dados = snap.val() || {};
    window.__getechUsuarios = dados;
    if ($('listaUsuario')?.dataset.exibir === '1') exibirUsuarios(dados, $('listaUsuario'));
  }, err => console.error('Erro ao carregar usuários:', err));
}

$('cadastroMaquinas')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (perfilAtual !== 'gestor') return;
  const el = $('dadosmaquina');
  try {
    await push(ref(db, 'maquinas'), {
      nomeMaquina: $('nomeMaquina')?.value.trim() || '',
      modeloMaquina: $('modelo')?.value.trim() || '',
      numeroDeSerie: $('numeroSerie')?.value.trim() || '',
      criadoEm: new Date().toISOString(),
      criadoPor: auth.currentUser.uid
    });
    mensagem(el, 'Máquina cadastrada com sucesso!');
    e.target.reset();
  } catch (erro) {
    mostrarErroFirebase('Não foi possível cadastrar a máquina', erro, el);
  }
});

$('ordemServico')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (perfilAtual !== 'gestor') return;
  const el = $('ordem_servico');
  try {
    await push(ref(db, 'ordensServico'), {
      maquinaOs: $('maquinaOS')?.value.trim() || '',
      descricaoOs: $('descricaoOS')?.value.trim() || '',
      statusOs: $('statusOS')?.value || 'pendente',
      criadoEm: new Date().toISOString(),
      criadoPor: auth.currentUser.uid
    });
    mensagem(el, 'Ordem de Serviço registrada com sucesso!');
    e.target.reset();
  } catch (erro) {
    mostrarErroFirebase('Não foi possível registrar a ordem de serviço', erro, el);
  }
});

$('btnConsultarMaquinas')?.addEventListener('click', async () => {
  try { exibirMaquinas((await get(ref(db, 'maquinas'))).val(), $('listaMaquina')); }
  catch (erro) { mostrarErroFirebase('Erro ao consultar máquinas', erro, $('dadosmaquina')); }
});

$('btnBuscarMaquinas')?.addEventListener('click', async () => {
  try {
    const dados = (await get(ref(db, 'maquinas'))).val() || {};
    const termo = ($('buscaNomeMaquinas')?.value || '').toLowerCase().trim();
    const filtrados = Object.fromEntries(Object.entries(dados).filter(([,m]) => String(m.nomeMaquina || '').toLowerCase().includes(termo)));
    exibirMaquinas(filtrados, $('listaMaquina'));
  } catch (erro) { mostrarErroFirebase('Erro ao filtrar máquinas', erro, $('dadosmaquina')); }
});

$('btnConsultarOS')?.addEventListener('click', async () => {
  try { exibirOS((await get(ref(db, 'ordensServico'))).val(), $('listaOS')); }
  catch (erro) { mostrarErroFirebase('Erro ao consultar ordens de serviço', erro, $('ordem_servico')); }
});

$('btnConsultarUsuarios')?.addEventListener('click', () => {
  const dados = window.__getechUsuarios || {};
  const lista = $('listaUsuario');
  if (lista) lista.dataset.exibir = '1';
  exibirUsuarios(dados, lista);
});

$('btnBuscarUsuario')?.addEventListener('click', () => {
  const termo = ($('buscaNomeUsuario')?.value || '').toLowerCase().trim();
  const dados = window.__getechUsuarios || {};
  const filtrados = Object.fromEntries(Object.entries(dados).filter(([,u]) => String(u.nome || u.nomeUsuario || '').toLowerCase().includes(termo)));
  const lista = $('listaUsuario');
  if (lista) lista.dataset.exibir = '1';
  exibirUsuarios(filtrados, lista);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  try {
    const snap = await get(ref(db, `usuarios/${user.uid}`));
    perfilAtual = String(snap.val()?.tipo || '').toLowerCase();
    if (perfilAtual !== 'gestor') {
      console.warn('Usuário autenticado sem perfil gestor para o sistema.');
      return;
    }
    iniciarListeners();
  } catch (erro) {
    mostrarErroFirebase('Erro ao validar o acesso ao sistema', erro, $('dadosmaquina'));
  }
});
