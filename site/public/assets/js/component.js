// Componentes das páginas públicas — sem bloqueio de autenticação.
(function(){
  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
})();

function carregarComponente(id, arquivo){
  return fetch(arquivo).then(r=>{
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  }).then(html=>{
    const el=document.getElementById(id);
    if(el) el.innerHTML=html;
  }).catch(err=>console.error(`Erro ao carregar componente ${id}:`,err));
}

function inicializarMenuMobile(){
  const btn = document.getElementById('menuMobile');
  const menu = document.getElementById('mainMenu');
  if(!btn || !menu) return;

  const fechar = () => {
    menu.classList.remove('active');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Abrir menu');
  };

  btn.addEventListener('click', () => {
    const aberto = menu.classList.toggle('active');
    btn.classList.toggle('active', aberto);
    btn.setAttribute('aria-expanded', String(aberto));
    btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });

  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', fechar));

  window.addEventListener('resize', () => {
    if(window.innerWidth > 800) fechar();
  });
}

function inicializarToggleTema(){
  inicializarMenuMobile();
  const btn=document.getElementById('themeToggle');
  const icon=document.getElementById('themeIcon');
  if(!btn) return;
  const aplicar=tema=>{
    document.documentElement.setAttribute('data-theme',tema);
    localStorage.setItem('theme',tema);
    if(icon) icon.textContent=tema==='dark'?'🌙':'☀️';
    btn.setAttribute('aria-label',tema==='dark'?'Ativar tema claro':'Ativar tema escuro');
  };
  aplicar(document.documentElement.getAttribute('data-theme')||'dark');
  btn.addEventListener('click',()=>aplicar((document.documentElement.getAttribute('data-theme')||'dark')==='dark'?'light':'dark'));
}

document.addEventListener('DOMContentLoaded',()=>{
  carregarComponente('header','../components/header.html').then(inicializarToggleTema);
  carregarComponente('footer','../components/footer.html');
});

window.carregarComponente=carregarComponente;
window.inicializarToggleTema=inicializarToggleTema;
