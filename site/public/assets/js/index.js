document.addEventListener('DOMContentLoaded',()=>{
  const hero=document.querySelector('.hero-card');
  const modules=document.querySelector('.modules-grid');
  const stats=document.querySelector('.stats-grid');
  const titles=document.querySelectorAll('.section-title');
  setTimeout(()=>{
    hero?.classList.remove('hidden-track');
    modules?.classList.remove('hidden-track');
    stats?.classList.remove('hidden-track');
    titles.forEach(t=>t.classList.remove('hidden-track'));
  },200);
});
