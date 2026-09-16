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
document.addEventListener("DOMContentLoaded", () => {
  // 1. Injeta o HTML do componente no final do <body>
  const widgetHTML = `
    <div class="acessibilidade-widget">
      <button id="btnAcessibilidade" class="btn-acessibilidade-toggle" title="Opções de Acessibilidade">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/>
        </svg>
      </button>

      <div id="menuAcessibilidade" class="acessibilidade-menu">
        <h4>Acessibilidade</h4>
        
        <!-- Tema -->
        <div class="acessibilidade-opcao">
          <label>Tema Contraste:</label>
          <div class="acessibilidade-botoes">
            <button id="btnModoClaro" class="acessibilidade-btn">☀️ Claro</button>
            <button id="btnModoEscuro" class="acessibilidade-btn">🌙 Escuro</button>
          </div>
        </div>

        <!-- Fonte -->
        <div class="acessibilidade-opcao">
          <label>Tamanho do Texto:</label>
          <div class="acessibilidade-botoes">
            <button id="btnDiminuirFonte" class="acessibilidade-btn">A-</button>
            <button id="btnResetFonte" class="acessibilidade-btn">A</button>
            <button id="btnAumentarFonte" class="acessibilidade-btn">A+</button>
          </div>
        </div>

        <!-- Daltonismo -->
        <div class="acessibilidade-opcao">
          <label for="selectDaltonismo">Modo Daltonismo:</label>
          <select id="selectDaltonismo" class="acessibilidade-select">
            <option value="padrao">Padrão (Desativado)</option>
            <option value="protanopia">Protanopia (Vermelho)</option>
            <option value="deuteranopia">Deuteranopia (Verde)</option>
            <option value="tritanopia">Tritanopia (Azul)</option>
          </select>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", widgetHTML);

  // 2. Elementos DOM
  const widget = document.querySelector(".acessibilidade-widget");
  const btnToggle = document.getElementById("btnAcessibilidade");
  const menu = document.getElementById("menuAcessibilidade");
  const btnModoEscuro = document.getElementById("btnModoEscuro");
  const btnModoClaro = document.getElementById("btnModoClaro");
  const btnAumentar = document.getElementById("btnAumentarFonte");
  const btnDiminuir = document.getElementById("btnDiminuirFonte");
  const btnReset = document.getElementById("btnResetFonte");
  const selectDaltonismo = document.getElementById("selectDaltonismo");

  // Tamanho base de fonte
  let tamanhoFonteAtual = parseInt(localStorage.getItem("gte_fonte")) || 100;

  // 3. Funções Globais
  function aplicarConfiguracoes() {
    // Aplicar Tema
    const tema = localStorage.getItem("gte_tema");
    if (tema === "escuro") {
      document.body.classList.add("modo-escuro");
    } else {
      document.body.classList.remove("modo-escuro");
    }

    // Aplicar Fonte
    document.documentElement.style.fontSize = `${tamanhoFonteAtual}%`;

    // Aplicar Daltonismo
    const daltonismo = localStorage.getItem("gte_daltonismo") || "padrao";
    document.body.classList.remove("daltonismo-protanopia", "daltonismo-deuteranopia", "daltonismo-tritanopia");
    if (daltonismo !== "padrao") {
      document.body.classList.add(`daltonismo-${daltonismo}`);
    }
    selectDaltonismo.value = daltonismo;
  }

  // 4. Lógica de Arrastar (Drag and Drop)
  let isDragging = false;
  let hasDragged = false;
  let startX, startY, initialLeft, initialTop;

  const startDrag = (e) => {
    // Não ativa drag se clicar dentro do menu interno
    if (e.target.closest(".acessibilidade-menu")) return;

    isDragging = true;
    hasDragged = false;

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    const rect = widget.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    // Remove o transform do CSS para usar apenas top/left absolutos
    widget.style.transform = "none";
    widget.style.left = `${initialLeft}px`;
    widget.style.top = `${initialTop}px`;
    widget.style.bottom = "auto";
  };

  const onDrag = (e) => {
    if (!isDragging) return;

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Se moveu mais de 3px, considera movimento e impede a abertura do menu
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasDragged = true;
    }

    let newLeft = initialLeft + deltaX;
    let newTop = initialTop + deltaY;

    // Limites da tela para não sumir
    const maxLeft = window.innerWidth - widget.offsetWidth;
    const maxTop = window.innerHeight - widget.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    widget.style.left = `${newLeft}px`;
    widget.style.top = `${newTop}px`;
  };

  const stopDrag = () => {
    isDragging = false;
  };

  // Eventos de Arraste (Desktop e Mobile)
  widget.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);

  widget.addEventListener("touchstart", startDrag, { passive: true });
  window.addEventListener("touchmove", onDrag, { passive: true });
  window.addEventListener("touchend", stopDrag);

  // 5. Listeners de Evento

  // Abrir / Fechar menu (somente se não esteve arrastando)
  btnToggle.addEventListener("click", (e) => {
    if (hasDragged) {
      e.stopPropagation();
      return;
    }
    menu.classList.toggle("ativo");
  });

  // Tema Escuro / Claro
  btnModoEscuro.addEventListener("click", () => {
    localStorage.setItem("gte_tema", "escuro");
    aplicarConfiguracoes();
  });

  btnModoClaro.addEventListener("click", () => {
    localStorage.setItem("gte_tema", "claro");
    aplicarConfiguracoes();
  });

  // Alteração de Fontes
  btnAumentar.addEventListener("click", () => {
    if (tamanhoFonteAtual < 150) {
      tamanhoFonteAtual += 10;
      localStorage.setItem("gte_fonte", tamanhoFonteAtual);
      aplicarConfiguracoes();
    }
  });

  btnDiminuir.addEventListener("click", () => {
    if (tamanhoFonteAtual > 70) {
      tamanhoFonteAtual -= 10;
      localStorage.setItem("gte_fonte", tamanhoFonteAtual);
      aplicarConfiguracoes();
    }
  });

  btnReset.addEventListener("click", () => {
    tamanhoFonteAtual = 100;
    localStorage.setItem("gte_fonte", 100);
    aplicarConfiguracoes();
  });

  // Daltonismo Select
  selectDaltonismo.addEventListener("change", (e) => {
    localStorage.setItem("gte_daltonismo", e.target.value);
    aplicarConfiguracoes();
  });

  // Fechar menu se clicar fora
  document.addEventListener("click", (e) => {
    if (!btnToggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("ativo");
    }
  });

  // Inicializa as preferências salvas
  aplicarConfiguracoes();
});