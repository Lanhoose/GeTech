function scrollToChat() {
            document.getElementById('atendimento').scrollIntoView({ behavior: 'smooth' });
        }

        // Lógica do Chatbot Automatizado
        const chatMessages = document.getElementById('chatMessages');
        const chatForm = document.getElementById('chatForm');
        const userInput = document.getElementById('userInput');

        let passoAtual = 0;
        const dadosColetados = { nome: '', email: '', problema: '', data: '' };

        const perguntas = [
            "Olá! Sou o assistente da GeTech. Para começarmos, qual é o seu **nome**?",
            "Prazer, {nome}! Qual o seu **e-mail** para contato?",
            "Ótimo! Agora, por favor, descreva brevemente o **problema da sua máquina**:",
            "Perfeito, {nome}! Recebemos as informações com sucesso. Nossa equipe técnica analisará o problema e entrará em contato via e-mail ({email}) muito em breve! 🛠️"
        ];

        function adicionarMensagem(texto, remetente) {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message', remetente);
            msgDiv.innerHTML = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight; 
        }

        function iniciarChat() {
            adicionarMensagem(perguntas[passoAtual], 'bot');
        }

        function salvarMensagemNoSistema(novoChamado) {
            let listaMensagens = JSON.parse(localStorage.getItem('chamadosChatbot')) || [];
            novoChamado.data = new Date().toLocaleString('pt-BR');
            listaMensagens.push(novoChamado);
            localStorage.setItem('chamadosChatbot', JSON.stringify(listaMensagens));
            console.log("Chamado guardado na Caixa de Mensagens!", novoChamado);
        }

        chatForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const respostaUser = userInput.value.trim();
            if (!respostaUser) return;

            adicionarMensagem(respostaUser, 'user');
            userInput.value = '';

            if (passoAtual === 0) {
                dadosColetados.nome = respostaUser;
                passoAtual++;
                let proximaPergunta = perguntas[passoAtual].replace('{nome}', dadosColetados.nome);
                setTimeout(() => adicionarMensagem(proximaPergunta, 'bot'), 600);
            } 
            else if (passoAtual === 1) {
                dadosColetados.email = respostaUser;
                passoAtual++;
                let proximaPergunta = perguntas[passoAtual];
                setTimeout(() => adicionarMensagem(proximaPergunta, 'bot'), 600);
            } 
            else if (passoAtual === 2) {
                dadosColetados.problema = respostaUser;
                passoAtual++;
                
                let mensagemFinal = perguntas[passoAtual]
                                    .replace('{nome}', dadosColetados.nome)
                                    .replace('{email}', dadosColetados.email);
                
                setTimeout(() => {
                    adicionarMensagem(mensagemFinal, 'bot');
                    
                    userInput.disabled = true;
                    chatForm.querySelector('button').disabled = true;
                    userInput.placeholder = "Atendimento concluído.";
                    
                    salvarMensagemNoSistema(dadosColetados);
                }, 600);
            }
        });

        // Verificação rápida local do avatar do usuário logado
        document.addEventListener('DOMContentLoaded', () => {
            const usr = JSON.parse(localStorage.getItem('usuarioLogado'));
            const avatar = document.getElementById('avatarUsuario');
            if (usr && avatar) {
                avatar.style.display = 'inline-block';
            }
            iniciarChat();
        });