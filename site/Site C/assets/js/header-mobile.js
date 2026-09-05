/* Menu hambúrguer global do Site C — equivalente ao header responsivo do Public */
document.addEventListener('DOMContentLoaded', () => {
    const botao = document.getElementById('menuMobileSiteC');
    const nav = document.querySelector('header nav');

    if (!botao || !nav) return;

    const fecharMenu = () => {
        botao.classList.remove('ativo');
        botao.setAttribute('aria-expanded', 'false');
        botao.setAttribute('aria-label', 'Abrir menu');
        nav.classList.remove('menu-aberto');
    };

    botao.addEventListener('click', () => {
        const aberto = nav.classList.toggle('menu-aberto');
        botao.classList.toggle('ativo', aberto);
        botao.setAttribute('aria-expanded', String(aberto));
        botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) fecharMenu();
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) fecharMenu();
    });
});
