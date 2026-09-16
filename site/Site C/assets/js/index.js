import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

document.addEventListener('DOMContentLoaded',()=>{
 const heroSubtitulo=document.getElementById('heroSubtitulo') || document.querySelector('.hero-subtitulo');
 onAuthStateChanged(auth,async user=>{
  if(!user||!heroSubtitulo)return;
  try{const snap=await get(ref(db,`usuarios/${user.uid}`));const d=snap.val()||{};const nome=d.nome||user.email?.split('@')[0]||'Usuário';heroSubtitulo.textContent=`Olá, ${nome}! Seja bem-vindo de volta à GeTech. Soluções completas e suporte técnico ao seu alcance.`;}catch(e){console.error(e);}
 });

 // =====================================================
 //  MODAL DOS CARDS "SOBRE A GETECH"
 // =====================================================
 const dadosTopicos = {
  multissetorial: {
   titulo: 'Atuação Multissetorial',
   descricao: 'Atendimento especializado para diversas áreas da indústria nacional.',
   detalhes: [
    'Setor automotivo: linhas de montagem e robótica industrial',
    'Setor alimentício: equipamentos com padrões sanitários rígidos',
    'Setor metalúrgico: máquinas pesadas e estruturas de grande porte',
    'Setor agrícola: maquinário de campo e sistemas de irrigação'
   ]
  },
  preventiva: {
   titulo: 'Manutenção Preventiva',
   descricao: 'Foco em evitar paradas não planejadas e maximizar a vida útil das máquinas.',
   detalhes: [
    'Inspeções periódicas programadas conforme o plano de manutenção',
    'Substituição de peças antes da falha, com base em histórico de uso',
    'Relatórios técnicos detalhados após cada visita',
    'Redução de custos com paradas emergenciais'
   ]
  },
  inteligente: {
   titulo: 'Suporte Inteligente',
   descricao: 'Assistente virtual exclusivo para apoio técnico rápido e triagem de dúvidas.',
   detalhes: [
    'ChatBot disponível 24h para dúvidas iniciais',
    'Triagem automática que direciona ao técnico certo',
    'Respostas rápidas para problemas recorrentes',
    'Abertura de chamado técnico direto pelo chat'
   ]
  }
 };

 const modal = document.getElementById('modalSobre');
 const modalTitulo = document.getElementById('modalTitulo');
 const modalDescricao = document.getElementById('modalDescricao');
 const modalDetalhes = document.getElementById('modalDetalhes');
 const fecharModal = document.getElementById('fecharModal');
 const cards = document.querySelectorAll('.topico-item.clicavel');

 function abrirModal(chave){
  const dados = dadosTopicos[chave];
  if(!dados || !modal) return;
  modalTitulo.textContent = dados.titulo;
  modalDescricao.textContent = dados.descricao;
  modalDetalhes.innerHTML = `<ul>${dados.detalhes.map(item=>`<li>${item}</li>`).join('')}</ul>`;
  modal.style.display = 'flex';
 }

 function fecharModalSobre(){
  if(modal) modal.style.display = 'none';
 }

 cards.forEach(card=>{
  card.addEventListener('click', () => abrirModal(card.dataset.topico));
 });

 if(fecharModal) fecharModal.addEventListener('click', fecharModalSobre);
 if(modal){
  modal.addEventListener('click', (e) => {
   if(e.target === modal) fecharModalSobre();
  });
 }
 document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') fecharModalSobre();
 });
});