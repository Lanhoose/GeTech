import { auth, db } from "../../../Site C/assets/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get, push, set, remove } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { registrarAuditoria } from "./auditoria.js";

let ordens = [];
let usuarioAtual = null;
const tabela = document.getElementById("tabela-ordens");

function escapar(v){return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
async function carregarOrdens(){
  const snap=await get(ref(db,'ordens'));
  const dados=snap.val()||{};
  ordens=Object.entries(dados).map(([id,v])=>({id,...v}));
  renderizarTabela();
}
function trocarTela(tela,botao){
  document.getElementById('tela-cadastro').style.display='none'; document.getElementById('tela-rastreio').style.display='none'; document.getElementById('tela-frete').style.display='none';
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('ativo')); if(botao)botao.classList.add('ativo');
  const el=document.getElementById(`tela-${tela}`); if(el)el.style.display='block';
}
async function salvarOrdem(){
  if(!usuarioAtual){alert('Usuário não autenticado.');return;}
  const getv=id=>document.getElementById(id)?.value?.trim()||'';
  const ordem={cliente:getv('cliente'),produto:getv('produto'),quantidade:getv('quantidade'),responsavel:getv('responsavel'),cidade:getv('cidade'),status:getv('status'),prioridade:getv('prioridade'),prazo:getv('prazo'),criadoEm:new Date().toISOString(),atualizadoEm:new Date().toISOString(),criadoPor:usuarioAtual.uid};
  if(!ordem.cliente||!ordem.produto){alert('Preencha os campos.');return;}
  const r=push(ref(db,'ordens')); await set(r,ordem); ordens.push({id:r.key,...ordem}); await registrarAuditoria('Ordens: nova ordem', `Ordem para ${ordem.cliente} / ${ordem.produto} criada.`, 'info'); renderizarTabela(); limparCampos();
}
function renderizarTabela(){
 if(!tabela)return; tabela.innerHTML='';
 ordens.forEach((o,i)=>{tabela.innerHTML+=`<tr><td>${i+1}</td><td>${escapar(o.cliente)}</td><td>${escapar(o.produto)}</td><td>${escapar(o.quantidade)}</td><td>${escapar(o.responsavel)}</td><td>${escapar(o.cidade)}</td><td>${escapar(o.status)}</td><td>${escapar(o.prioridade)}</td><td>${escapar(o.prazo)}</td></tr>`;});
}
function limparCampos(){['cliente','produto','quantidade','responsavel','cidade','prazo'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});}
async function excluirOrdem(){
 const numero=prompt('Digite o número da ordem:'); if(numero===null)return; const idx=Number(numero)-1; if(!Number.isInteger(idx)||!ordens[idx]){alert('Número de ordem inválido.');return;}
 const ordemExcluida=ordens[idx]; await remove(ref(db,`ordens/${ordemExcluida.id}`)); await registrarAuditoria('Ordens: ordem excluída', `Ordem de ${ordemExcluida.cliente} / ${ordemExcluida.produto} excluída.`, 'warning'); ordens.splice(idx,1); renderizarTabela();
}
function baixarPDF(){window.print();}
function baixarExcel(){let c='Cliente,Produto,Quantidade\n'; ordens.forEach(o=>c+=`"${String(o.cliente).replaceAll('"','""')}","${String(o.produto).replaceAll('"','""')}","${o.quantidade}"\n`); const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:'text/csv;charset=utf-8'}));a.download='ordens.csv';a.click();URL.revokeObjectURL(a.href);}
function rastrearPedido(){const codigo=document.getElementById('codigo-rastreio')?.value.toLowerCase()||'';const r=document.getElementById('resultado-rastreio');const o=ordens.find(x=>String(x.cliente).toLowerCase().includes(codigo));if(!r)return;r.innerHTML=o?`<div class="form-card"><h3>Pedido encontrado</h3><p><strong>Cliente:</strong> ${escapar(o.cliente)}</p><p><strong>Produto:</strong> ${escapar(o.produto)}</p><p><strong>Status:</strong> ${escapar(o.status)}</p><p><strong>Prioridade:</strong> ${escapar(o.prioridade)}</p></div>`:`<div class="form-card">Pedido não encontrado.</div>`;}
function calcularFrete(){const peso=Number(document.getElementById('peso')?.value),dist=Number(document.getElementById('distancia')?.value),tipo=Number(document.getElementById('tipo-entrega')?.value);if(!peso||!dist){alert('Preencha os dados.');return;}document.getElementById('resultado-frete').innerHTML=`R$ ${(((peso*.45)+(dist*.12))*tipo).toFixed(2)}`;}
async function logout(){ await registrarAuditoria('Logout', 'Usuário encerrou a sessão.', 'info'); await auth.signOut(); location.href='../pages/login.html'; }
Object.assign(window,{trocarTela,salvarOrdem,excluirOrdem,baixarPDF,baixarExcel,rastrearPedido,calcularFrete,logout});
onAuthStateChanged(auth,async user=>{usuarioAtual=user;if(!user){location.href='../../Site C/pages/login.html';return;}try{const snap=await get(ref(db,`usuarios/${user.uid}`));if(!snap.exists()||String(snap.val().tipo).toLowerCase()!=='gestor'){alert('Acesso restrito. Apenas gestores podem acessar esta área.');location.href='../../Site C/pages/login.html';return;}await carregarOrdens();}catch(e){console.error(e);alert('Não foi possível carregar as ordens.');}});
