document.getElementById('maintenanceForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Capturando os valores
    const machine = document.getElementById('machineName').value;
    const type = document.getElementById('type').value;
    const date = document.getElementById('date').value;
    const desc = document.getElementById('description').value;

    // Criando a linha na tabela
    const tableBody = document.getElementById('tableBody');
    const newRow = tableBody.insertRow();

    newRow.innerHTML = `
        <td>${machine}</td>
        <td><span class="badge">${type}</span></td>
        <td>${date}</td>
        <td>${desc}</td>
    `;

    // Limpando o formulário
    this.reset();
});