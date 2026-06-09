const containerMensagens = document.getElementById('containerMensagens');
    const btnLimparTudo = document.getElementById('btnLimparTudo');

    // Função para renderizar as mensagens na tela
    function carregarMensagens() {
        const chamados = JSON.parse(localStorage.getItem('chamadosChatbot')) || [];

        if (chamados.length === 0) {
            btnLimparTudo.style.display = 'none'; 
            containerMensagens.innerHTML = `
                <div class="sem-mensagens">
                    <h3>Sua caixa está limpa!</h3>
                    <p>Nenhuma mensagem ou ordem de serviço foi enviada pelo assistente virtual até o momento.</p>
                </div>
            `;
            return;
        }

        btnLimparTudo.style.display = 'block';
        containerMensagens.innerHTML = ''; 

        // Cria uma cópia e reverte para não mutar o array original do localStorage ao lidar com os índices reais
        const chamadosInvertidos = [...chamados].reverse();

        chamadosInvertidos.forEach((chamado, indexInvertido) => {
            // Recupera o index original correto baseado no array original
            const indexReal = (chamados.length - 1) - indexInvertido;

            const card = document.createElement('div');
            card.classList.add('card-mensagem');
            card.innerHTML = `
                <div class="card-header-msg">
                    <span><strong>ID Chamado:</strong> #${indexReal + 1}</span>
                    <span>${chamado.data || 'Data não registrada'}</span>
                </div>
                <div class="card-body-msg">
                    <p><span class="label">Cliente:</span> ${chamado.nome}</p>
                    <p><span class="label">E-mail de Contato:</span> <a href="mailto:${chamado.email}">${chamado.email}</a></p>
                    <p class="problema-texto"><span class="label">Descrição do Problema:</span><br>${chamado.problema}</p>
                </div>
                <div style="text-align: right; margin-top: 15px;">
                    <button class="btn-deletar-unica" onclick="deletarMensagem(${indexReal})">Excluir Registro</button>
                </div>
            `;
            containerMensagens.appendChild(card);
        });
    }

    // Função para deletar uma mensagem específica
    function deletarMensagem(index) {
        if(confirm("Tem certeza que deseja apagar este registro de atendimento?")) {
            let chamados = JSON.parse(localStorage.getItem('chamadosChatbot')) || [];
            chamados.splice(index, 1); 
            localStorage.setItem('chamadosChatbot', JSON.stringify(chamados)); 
            carregarMensagens(); 
        }
    }

    // Função para limpar toda a caixa
    function limparTodasMensagens() {
        if(confirm("ATENÇÃO: Você tem certeza que deseja apagar TODAS as mensagens recebidas? Esta ação não pode ser desfeita.")) {
            localStorage.removeItem('chamadosChatbot');
            carregarMensagens();
        }
    }

    document.addEventListener('DOMContentLoaded', carregarMensagens);