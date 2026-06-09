// Configuração Firebase (Mantenha a sua configuração original)
    const firebaseConfig = {
      apiKey: "AIzaSyClNzm5k4vFnGcpK_6pdnJyB6WkOhrgvlY",
      authDomain: "dados-maquinas.firebaseapp.com",
      databaseURL: "https://dados-maquinas-default-rtdb.firebaseio.com",
      projectId: "dados-maquinas",
      storageBucket: "dados-maquinas.firebasestorage.app",
      messagingSenderId: "501507462769",
      appId: "1:501507462769:web:9c87dc243feecf6d16edd0"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    function exibirMaquinas(dados, container) {
      container.innerHTML = "";
      if (!dados) { container.innerHTML = "<p>Nenhum registro.</p>"; return; }
      for (let id in dados) {
        const item = dados[id];
        const card = document.createElement('div');
        card.className = 'card-item';
        card.innerHTML = `
          <strong>Máquina:</strong> ${item.nomeMaquina}<br>
          <strong>Modelo:</strong> ${item.modeloMaquina}<br>
          <strong>S/N:</strong> ${item.numeroDeSerie}
        `;
        container.appendChild(card);
      }
    }

    function exibirUsuarios(dados, container) {
      container.innerHTML = "";
      if (!dados) { container.innerHTML = "<p>Nenhum usuário.</p>"; return; }
      for (let id in dados) {
        const item = dados[id];
        const card = document.createElement('div');
        card.className = 'card-item';
        card.innerHTML = `
          <strong>Nome:</strong> ${item.nomeUsuario}<br>
          <strong>Perfil:</strong> ${item.TipoUsuario}
        `;
        container.appendChild(card);
      }
    }

    function exibirOS(dados, container) {
      container.innerHTML = "";
      if (!dados) { container.innerHTML = "<p>Sem histórico.</p>"; return; }
      for (let id in dados) {
        const item = dados[id];
        const card = document.createElement('div');
        card.className = 'card-item';
        card.innerHTML = `
          <strong>Equipamento:</strong> ${item.maquinaOs}<br>
          <strong>Serviço:</strong> ${item.descricaoOs}<br>
          <span style="color:var(--azul-industrial); font-weight:bold;">Status: ${item.statusOs}</span>
        `;
        container.appendChild(card);
      }
    }

    // Eventos de Cadastro (Máquinas)
    document.getElementById('cadastroMaquinas').addEventListener('submit', function(e) {
      e.preventDefault();
      database.ref('maquinas').push({
        nomeMaquina: document.getElementById('nomeMaquina').value,
        modeloMaquina: document.getElementById('modelo').value,
        numeroDeSerie: document.getElementById('numeroSerie').value
      }).then(() => {
        document.getElementById('dadosmaquina').innerText = 'Máquina cadastrada com sucesso!';
        this.reset();
      });
    });

    // Botões de Consulta
    document.getElementById('btnConsultarMaquinas').addEventListener('click', () => {
      database.ref('maquinas').once('value').then(snap => exibirMaquinas(snap.val(), document.getElementById('listaMaquina')));
    });

    document.getElementById('btnConsultarOS').addEventListener('click', () => {
      database.ref('ordemservico').once('value').then(snap => exibirOS(snap.val(), document.getElementById('listaOS')));
    });

    // Cadastro OS
    document.getElementById('ordemServico').addEventListener('submit', function(e) {
      e.preventDefault();
      database.ref('ordemservico').push({
        maquinaOs: document.getElementById('maquinaOS').value,
        descricaoOs: document.getElementById('descricaoOS').value,
        statusOs: document.getElementById('statusOS').value
      }).then(() => {
        document.getElementById('ordem_servico').innerText = 'O.S. Registrada!';
        this.reset();
      });
    });