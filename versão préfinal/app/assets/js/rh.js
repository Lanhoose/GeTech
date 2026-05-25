document.addEventListener('DOMContentLoaded', () => {
    // Variáveis Globais de Controle
    let funcionarioAtivoNome = "";
    let funcionarioAtivoEmail = "";

    // Captura de elementos da DOM
    const btnCadastrar = document.querySelector("#btnCadastrar");
    const btnEntrada = document.querySelector("#btnEntrada");
    const btnSaida = document.querySelector("#btnSaida");
    const corpoTabelaRH = document.querySelector("#corpoTabelaRH");
    const visorStatus = document.querySelector("#visorStatus");
    const colaboradorSelecionado = document.querySelector("#colaboradorSelecionado");

    // Elementos da barra de navegação superior
    const navCadastro = document.querySelector("#nav-cadastro");
    const navPonto = document.querySelector("#nav-ponto");

    // Função auxiliar para verificar se o e-mail existe no LocalStorage
    function verificarUsuarioNoBanco(email) {
        const dadosLocais = localStorage.getItem('usuarios');
        if (!dadosLocais) return false;

        try {
            const listaUsuarios = JSON.parse(dadosLocais);
            // Procura por algum usuário que possua o e-mail idêntico ao informado
            return listaUsuarios.some(user => user.email.trim().toLowerCase() === email.trim().toLowerCase());
        } catch (e) {
            console.error("Erro ao ler banco de dados do localStorage", e);
            return false;
        }
    }

    // 1. Alternador de Telas fluido com gerenciamento estético das abas
    window.trocarTela = function(tela) {
        const telaCadastro = document.querySelector("#tela-cadastro");
        const telaPonto = document.querySelector("#tela-ponto");

        if (tela === 'cadastro') {
            telaCadastro.style.display = "block";
            telaPonto.style.display = "none";
            navCadastro.classList.add("active");
            navPonto.classList.remove("active");
        } else {
            telaCadastro.style.display = "none";
            telaPonto.style.display = "block";
            navCadastro.classList.remove("active");
            navPonto.classList.add("active");
        }
    }

    // 2. Cadastro de Funcionários e inserção na Tabela com validação do LocalStorage
    if (btnCadastrar) {
        btnCadastrar.addEventListener("click", () => {
            const nome = document.querySelector("#nomeFuncionario").value;
            const email = document.querySelector("#emailFuncionario").value;

            if (nome.trim() !== "" && email.trim() !== "") {
                
                // [Validação Solicitada]: Bloqueia o registro se não estiver no banco
                if (!verificarUsuarioNoBanco(email)) {
                    alert("🚨 Acesso Negado: Este e-mail não corresponde a um usuário registrado no banco de dados do sistema!");
                    return;
                }
                
                // Cria a linha na tabela aplicando a estilização do GeTech
                const newRow = corpoTabelaRH.insertRow();
                newRow.innerHTML = `
                    <td><strong>${nome}</strong></td>
                    <td>${email}</td>
                    <td>
                        <button class="btn-action" onclick="gerenciarPonto('${nome}', '${email}')">
                            Ponto ⏱️
                        </button>
                    </td>
                `;

                // Limpa os campos de texto do formulário
                document.querySelector("#nomeFuncionario").value = "";
                document.querySelector("#emailFuncionario").value = "";
            } else {
                alert("🚨 Por favor, preencha o Nome e o E-mail antes de cadastrar!");
            }
        });
    }

    // 3. Carrega o Colaborador selecionado para o Módulo de Ponto Digital
    window.gerenciarPonto = function(nome, email) {
        // Validação preventiva ao clicar diretamente na tabela
        if (!verificarUsuarioNoBanco(email)) {
            alert("🚨 Erro: O usuário associado a este registro foi removido ou está inválido no banco de dados.");
            return;
        }

        funcionarioAtivoNome = nome;
        funcionarioAtivoEmail = email;

        colaboradorSelecionado.innerHTML = `<i class="fas fa-user" style="color: var(--accent);"></i> Colaborador: <strong>${nome}</strong> <span style="font-size:0.9rem; color: var(--text-muted); font-weight:normal;">(${email})</span>`;
        visorStatus.textContent = "Sem registros hoje";
        visorStatus.style.color = "var(--text-primary)";
        
        // Troca para a tela do relógio de ponto
        trocarTela('ponto');
    }

    // 4. Lógica das Batidas de Ponto com carimbo de hora real
    function obterHoraAtual() {
        const agora = new Date();
        return agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    if (btnEntrada) {
        btnEntrada.addEventListener("click", () => {
            if (!funcionarioAtivoNome) return alert("Selecione um funcionário primeiro!");
            // Validação em tempo de execução antes de bater o ponto
            if (!verificarUsuarioNoBanco(funcionarioAtivoEmail)) return alert("Sessão Inválida: Usuário não consta no banco.");
            
            const hora = obterHoraAtual();
            visorStatus.textContent = `ENTRADA às ${hora}`;
            visorStatus.style.color = "#27ae60";
        });
    }

    if (btnSaida) {
        btnSaida.addEventListener("click", () => {
            if (!funcionarioAtivoNome) return alert("Selecione um funcionário primeiro!");
            // Validação em tempo de execução antes de bater o ponto
            if (!verificarUsuarioNoBanco(funcionarioAtivoEmail)) return alert("Sessão Inválida: Usuário não consta no banco.");
            
            const hora = obterHoraAtual();
            visorStatus.textContent = `SAÍDA às ${hora}`;
            visorStatus.style.color = "#c0392b";
        });
    }
});