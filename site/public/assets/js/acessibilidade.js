

// assets/js/acessibilidade.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cria o contêiner principal do VLibras
    const vlibrasContainer = document.createElement("div");
    vlibrasContainer.setAttribute("vw", "");
    vlibrasContainer.classList.add("enabled");

    // 2. Monta a estrutura interna necessária para o plugin
    vlibrasContainer.innerHTML = `
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
            <div class="vw-plugin-top-wrapper"></div>
        </div>
    `;

    // 3. Adiciona o contêiner ao final do body da página
    document.body.appendChild(vlibrasContainer);

    // 4. Carrega o script oficial do VLibras dinamicamente
    const scriptVlibras = document.createElement("script");
    scriptVlibras.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    scriptVlibras.async = true;

    // 5. Inicializa o widget assim que o script oficial terminar de carregar
    scriptVlibras.onload = () => {
        if (window.VLibras) {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
        }
    };

    // 6. Injeta o script externo no documento
    document.body.appendChild(scriptVlibras);
});