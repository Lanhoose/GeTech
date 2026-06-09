document.addEventListener('DOMContentLoaded', () => {
    // Alvo mudou para o container do overlay completo
    const formOverlay = document.getElementById('form-overlay');
    const btnAbrirForm = document.getElementById('btn-abrir-form');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnSalvar = document.getElementById('btn-salvar');
    const grid = document.getElementById('grid-depoimentos');

    // Abre e fecha o overlay de forma limpa
    btnAbrirForm.onclick = () => formOverlay.classList.remove('hidden');
    btnCancelar.onclick = () => formOverlay.classList.add('hidden');

    // Fecha o modal ao clicar fora da caixa do formulário (na área escura)
    formOverlay.onclick = (e) => {
        if (e.target === formOverlay) {
            formOverlay.classList.add('hidden');
        }
    };

    // Função auxiliar para gerar as iniciais do Nome para o Avatar
    const obterIniciais = (nomeCompleto) => {
        const partes = nomeCompleto.trim().split(' ');
        if (partes.length > 1) {
            return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
        }
        return partes[0][0].toUpperCase();
    };

    btnSalvar.onclick = () => {
        const nome = document.getElementById('nome').value;
        const cargo = document.getElementById('cargo').value;
        const texto = document.getElementById('texto').value;
        const nota = document.getElementById('nota').value; 

        if (nome && cargo && texto) {
            const card = document.createElement('article');
            card.className = 'card';
            
            const iniciais = obterIniciais(nome);
            
            // Nova estrutura HTML interna injetando o padrão dos diferenciais (aspas e avatar)
            card.innerHTML = `
                <div class="card-header">
                    <div class="stars">${nota}</div>
                    <span class="quote-icon">“</span>
                </div>
                <p>"${texto}"</p>
                <div class="card-footer">
                    <div class="avatar">${iniciais}</div>
                    <div class="user-info">
                        <strong>${nome}</strong>
                        <small>${cargo}</small>
                    </div>
                </div>
            `;
            
            grid.prepend(card);
            
            // Limpar campos e fechar o overlay
            document.querySelectorAll('.form-card input, .form-card textarea').forEach(i => i.value = '');
            formOverlay.classList.add('hidden');
        } else {
            alert("Por favor, preencha todos os campos!");
        }
    };
});