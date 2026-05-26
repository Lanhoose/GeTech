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
    const inputCep = document.querySelector("#cep");

    // Elementos da barra de navegação superior
    const navCadastro = document.querySelector("#btn-nav-cadastro");
    const navPonto = document.querySelector("#btn-nav-ponto");

    // Função auxiliar para verificar se o e-mail existe no LocalStorage
    function verificarUsuarioNoBanco(email) {
        const dadosLocais = localStorage.getItem('usuarios');
        if (!dadosLocais) return false;

        try {
            const listaUsuarios = JSON.parse(dadosLocais);
            return listaUsuarios.some(user => user.email.trim().toLowerCase() === email.trim().toLowerCase());
        } catch (e) {
            console.error("Erro ao ler banco de dados do localStorage", e);
            return false;
        }
    }

    // ==========================================================================
    // SISTEMA INTEGRADO DE INTEGRAÇÃO VIA CEP (MÉTODO CALLBACK)
    // ==========================================================================
    function limpa_formulário_cep() {
        document.querySelector('#rua').value = "";
        document.querySelector('#bairro').value = "";
        document.querySelector('#cidade').value = "";
        document.querySelector('#uf').value = "";
    }

    // Definido no escopo window para o script dinâmico (JSONP) conseguir acessar
    window.meu_callback = function(conteudo) {
        if (!("erro" in conteudo)) {
            document.querySelector('#rua').value = conteudo.logradouro || "Não informado";
            document.querySelector('#bairro').value = conteudo.bairro || "Não informado";
            document.querySelector('#cidade').value = conteudo.localidade;
            document.querySelector('#uf').value = conteudo.uf;
        } else {
            limpa_formulário_cep();
            alert("🚨 CEP não encontrado.");
        }
    }
        
    function pesquisacep(valor) {
        var cep = valor.replace(/\D/g, '');

        if (cep != "") {
            var validacep = /^[0-9]{8}$/;

            if(validacep.test(cep)) {
                document.querySelector('#rua').value = "...";
                document.querySelector('#bairro').value = "...";
                document.querySelector('#cidade').value = "...";
                document.querySelector('#uf').value = "...";

                var script = document.createElement('script');
                script.src = 'https://viacep.com.br/ws/'+ cep + '/json/?callback=meu_callback';
                document.body.appendChild(script);
            } else {
                limpa_formulário_cep();
                alert("🚨 Formato de CEP inválido.");
            }
        } else {
            limpa_formulário_cep();
        }
    }

    // Vincula a pesquisa quando o usuário sai do campo de CEP
    if (inputCep) {
        inputCep.addEventListener('blur', function() {
            pesquisacep(this.value);
        });
    }

    // ==========================================================================
    // CADASTRO DE COLABORADORES COM DADOS DE ENDEREÇO
    // ==========================================================================
    if (btnCadastrar) {
        btnCadastrar.addEventListener("click", () => {
            const nome = document.querySelector("#nomeFuncionario").value;
            const email = document.querySelector("#emailFuncionario").value;
            const cepValue = document.querySelector("#cep").value;
            const rua = document.querySelector("#rua").value;
            const bairro = document.querySelector("#bairro").value;
            const cidade = document.querySelector("#cidade").value;
            const uf = document.querySelector("#uf").value;

            if (nome.trim() !== "" && email.trim() !== "") {
                
                // Validação de segurança no LocalStorage institucional
                if (!verificarUsuarioNoBanco(email)) {
                    alert("🚨 Acesso Negado: Este e-mail não corresponde a um usuário registrado no banco de dados do sistema!");
                    return;
                }

                // Certifica de que a busca de CEP foi executada com sucesso antes de salvar
                if (!cidade || rua === "...") {
                    alert("🚨 Por favor, digite um CEP válido e aguarde a busca terminar.");
                    return;
                }
                
                const enderecoFormatado = `${rua}, ${bairro} - ${cidade}/${uf} (${cepValue})`;

                // Cria a linha na tabela aplicando a estilização estruturada
                const newRow = corpoTabelaRH.insertRow();
                newRow.innerHTML = `
                    <td><strong>${nome}</strong></td>
                    <td>${email}</td>
                    <td><small style="color: var(--text-muted); font-size:0.85rem;">${enderecoFormatado}</small></td>
                    <td>
                        <button class="btn-action" onclick="gerenciarPonto('${nome}', '${email}')">
                            Ponto ⏱️
                        </button>
                    </td>
                `;

                // Reseta todos os campos do formulário para nova entrada
                document.querySelector("#nomeFuncionario").value = "";
                document.querySelector("#emailFuncionario").value = "";
                document.querySelector("#cep").value = "";
                limpa_formulário_cep();

                alert("🎉 Colaborador admitido com sucesso!");
            } else {
                alert("🚨 Por favor, preencha o Nome e o E-mail antes de cadastrar!");
            }
        });
    }

    // ==========================================================================
    // CARGA E CONTROLE DO RELÓGIO DE PONTO DIGITAL
    // ==========================================================================
    window.gerenciarPonto = function(nome, email) {
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
        if (typeof window.trocarTela === 'function') {
            window.trocarTela('ponto');
        }
    }

    function obterHoraAtual() {
        const agora = new Date();
        return agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    if (btnEntrada) {
        btnEntrada.addEventListener("click", () => {
            if (!funcionarioAtivoNome) return alert("Selecione um funcionário primeiro!");
            if (!verificarUsuarioNoBanco(funcionarioAtivoEmail)) return alert("Sessão Inválida: Usuário não consta no banco.");
            
            const hora = obterHoraAtual();
            visorStatus.textContent = `ENTRADA às ${hora}`;
            visorStatus.style.color = "#27ae60";
        });
    }

    if (btnSaida) {
        btnSaida.addEventListener("click", () => {
            if (!funcionarioAtivoNome) return alert("Selecione um funcionário primeiro!");
            if (!verificarUsuarioNoBanco(funcionarioAtivoEmail)) return alert("Sessão Inválida: Usuário não consta no banco.");
            
            const hora = obterHoraAtual();
            visorStatus.textContent = `SAÍDA às ${hora}`;
            visorStatus.style.color = "#c0392b";
        });
    }
});