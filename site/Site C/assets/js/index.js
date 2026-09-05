import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

document.addEventListener('DOMContentLoaded',()=>{
 const heroSubtitulo=document.getElementById('heroSubtitulo') || document.querySelector('.hero-subtitulo');
 onAuthStateChanged(auth,async user=>{
  if(!user||!heroSubtitulo)return;
  try{const snap=await get(ref(db,`usuarios/${user.uid}`));const d=snap.val()||{};const nome=d.nome||user.email?.split('@')[0]||'Usuário';heroSubtitulo.textContent=`Olá, ${nome}! Seja bem-vindo de volta à GeTech. Soluções completas e suporte técnico ao seu alcance.`;}catch(e){console.error(e);}
 });
});
