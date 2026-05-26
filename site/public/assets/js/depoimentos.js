document.addEventListener('DOMContentLoaded', () => {
    const btnAbrirForm = document.getElementById('btn-abrir-form');
    const formContainer = document.getElementById('form-container');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnSalvar = document.getElementById('btn-salvar');
    const grid = document.getElementById('grid-depoimentos');

    btnAbrirForm.onclick = () => formContainer.classList.toggle('hidden');
    btnCancelar.onclick = () => formContainer.classList.add('hidden');

    btnSalvar.onclick = () => {
        const nome = document.getElementById('nome').value;
        const cargo = document.getElementById('cargo').value;
        const texto = document.getElementById('texto').value;
        const nota = document.getElementById('nota').value; // Captura as estrelas

        if (nome && cargo && texto) {
            const card = document.createElement('article');
            card.className = 'card';
            
            // Aqui a variável ${nota} substitui as estrelas fixas
            card.innerHTML = `
                <div class="stars">${nota}</div>
                <p>"${texto}"</p>
                <div class="card-footer">
                    <strong>${nome}</strong>
                    <small>${cargo}</small>
                </div>
            `;
            
            grid.prepend(card);
            
            // Limpar campos e fechar
            document.querySelectorAll('.form-card input, .form-card textarea').forEach(i => i.value = '');
            formContainer.classList.add('hidden');
        } else {
            alert("Preencha todos os campos!");
        }
    };
});