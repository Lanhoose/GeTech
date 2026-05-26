// ==========================================
// CONFIGURAÇÃO INICIAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    trocarTela('cadastro');
    atualizarSelectMaquinas(); // garante estado inicial correto do select
});

// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
let listaMaquinas = [];
let historicoOS   = [];

// Variáveis de controle para o modo de edição
let emModoEdicao = false;
let idMaquinaSendoEditada = null;


// ==========================================
// HELPERS
// ==========================================
function precisaManutencao(dataStr) {
    if (!dataStr) return false;
    const diffDias = (new Date() - new Date(dataStr)) / (1000 * 60 * 60 * 24);
    return diffDias > 90;
}

function formatarData(dataStr) {
    if (!dataStr) return '—';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

function diasDesde(dataStr) {
    if (!dataStr) return null;
    return Math.floor((new Date() - new Date(dataStr)) / (1000 * 60 * 60 * 24));
}


// ==========================================
// 1. TROCA DE TELAS
// ==========================================
function trocarTela(tela) {
    const sections     = document.querySelectorAll('.card-app');
    const cardMaquinas = sections[0];
    const cardOS       = sections[1];

    if (tela === 'cadastro') {
        cardMaquinas.style.display = 'block';
        cardOS.style.display       = 'none';
    } else {
        // Ao abrir OS, sincroniza o select com as máquinas mais recentes
        atualizarSelectMaquinas();
        cardMaquinas.style.display = 'none';
        cardOS.style.display       = 'block';
    }
}


// ==========================================
// 2. GESTÃO DE MÁQUINAS
// ==========================================
const formMaquinas = document.querySelector('#cadastroMaquinas');

if (formMaquinas) {
    formMaquinas.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome   = document.querySelector('#nomeMaquina').value.trim();
        const modelo = document.querySelector('#modelo').value.trim();
        const serie  = document.querySelector('#numeroSerie').value.trim();
        const data   = document.querySelector('#dataUltimaManutencao').value;

        // Verifica se o formulário está salvando uma edição ou criando um novo
        if (emModoEdicao) {
            // Atualiza os dados no índice correto do Array
            listaMaquinas[idMaquinaSendoEditada] = { nome, modelo, serie, dataUltimaManutencao: data };
            
            // Reseta o estado de edição
            emModoEdicao = false;
            idMaquinaSendoEditada = null;

            // Restaura o texto e estilo padrão do botão de envio
            const btnSub = formMaquinas.querySelector('button[type="submit"]');
            if (btnSub) {
                btnSub.textContent = "Cadastrar Máquina";
                btnSub.style.background = ""; 
            }

            document.querySelector('#dadosmaquina').innerHTML = `✅ Alterações em <strong>${nome}</strong> salvas com sucesso!`;
        } else {
            // Comportamento padrão: Adiciona uma nova máquina à lista
            listaMaquinas.push({ nome, modelo, serie, dataUltimaManutencao: data });

            const msg    = document.querySelector('#dadosmaquina');
            const alerta = precisaManutencao(data);

            msg.innerHTML = alerta
                ? `✅ <strong>${nome}</strong> cadastrado — ⚠️ <span style="color:#856404;">Manutenção preventiva recomendada (última há mais de 3 meses).</span>`
                : `✅ ${nome} cadastrado com sucesso!`;
        }

        formMaquinas.reset();

        // Atualiza os componentes dependentes na interface
        atualizarSelectMaquinas();
        exibirMaquinas();
    });
}

// Preenche o formulário com os dados da máquina selecionada para edição
function prepararEdicao(index) {
    const maq = listaMaquinas[index];

    // Joga os valores salvos de volta nos campos de texto
    document.querySelector('#nomeMaquina').value = maq.nome;
    document.querySelector('#modelo').value = maq.modelo;
    document.querySelector('#numeroSerie').value = maq.serie;
    document.querySelector('#dataUltimaManutencao').value = maq.dataUltimaManutencao;

    // Ativa os sinalizadores de edição
    emModoEdicao = true;
    idMaquinaSendoEditada = index;

    // Altera o visual do botão de submit para indicar a alteração
    const btnSub = formMaquinas.querySelector('button[type="submit"]');
    if (btnSub) {
        btnSub.textContent = "💾 Salvar Alterações";
        btnSub.style.background = "#27ae60"; 
    }

    // Move o foco da tela de volta para o topo do formulário suavemente
    formMaquinas.scrollIntoView({ behavior: 'smooth' });
}

function exibirMaquinas(filtro = '') {
    const container = document.querySelector('#listaMaquina');
    container.innerHTML = '';

    const filtradas = listaMaquinas.filter(m =>
        m.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    if (filtradas.length === 0) {
        container.innerHTML = '<p style="color:#999; margin-top:12px;">Nenhuma máquina encontrada.</p>';
        return;
    }

    filtradas.forEach((m, index) => {
        const alerta    = precisaManutencao(m.dataUltimaManutencao);
        const dias      = diasDesde(m.dataUltimaManutencao);
        const badge     = alerta
            ? `<span class="badge-alerta">⚠️ Manutenção Preventiva</span>`
            : `<span class="badge-ok">✔ Em dia</span>`;
        const cardClass = alerta ? 'maq-card alerta' : 'maq-card ok';

        container.innerHTML += `
            <div class="${cardClass}" style="position: relative; padding-bottom: 40px;">
                <strong>MAQ:</strong> ${m.nome} ${badge}
                &nbsp;|&nbsp; <strong>MOD:</strong> ${m.modelo}<br>
                <small style="color:#666;">
                    Série: ${m.serie}
                    &nbsp;·&nbsp;
                    Última manutenção: ${formatarData(m.dataUltimaManutencao)}
                    ${dias !== null ? `(${dias} dia${dias !== 1 ? 's' : ''} atrás)` : ''}
                </small>
                <button onclick="prepararEdicao(${index})" class="btn-app btn-outline-app" style="position: absolute; bottom: 8px; right: 8px; width: auto; padding: 4px 10px; font-size: 0.8rem;">
                    ✏️ Editar
                </button>
            </div>`;
    });
}

const btnBuscarMaquinas = document.querySelector('#btnBuscarMaquinas');
if (btnBuscarMaquinas) {
    btnBuscarMaquinas.addEventListener('click', () => {
        exibirMaquinas(document.querySelector('#buscaNomeMaquinas').value);
    });
}

const btnConsultarMaquinas = document.querySelector('#btnConsultarMaquinas');
if (btnConsultarMaquinas) {
    btnConsultarMaquinas.addEventListener('click', () => {
        document.querySelector('#buscaNomeMaquinas').value = '';
        exibirMaquinas();
    });
}


// ==========================================
// 2b. SINCRONIZAR SELECT DE MÁQUINAS NA OS
// ==========================================
function atualizarSelectMaquinas() {
    const select = document.querySelector('#maquinaOS');
    const aviso  = document.querySelector('#avisoMaquinaOS');
    if (!select) return;

    const selecaoAtual = select.value;
    select.innerHTML = '';

    if (listaMaquinas.length === 0) {
        select.innerHTML = '<option value="">-- Nenhuma máquina cadastrada --</option>';
        select.disabled  = true;
        if (aviso) aviso.style.display = 'block';
    } else {
        select.disabled  = false;
        if (aviso) aviso.style.display = 'none';

        select.innerHTML = '<option value="">-- Selecione uma máquina --</option>';

        listaMaquinas.forEach((m) => {
            const opt       = document.createElement('option');
            opt.value       = m.nome;
            opt.textContent = `${m.nome} — ${m.modelo} (Série: ${m.serie})`;
            select.appendChild(opt);
        });

        if (selecaoAtual) select.value = selecaoAtual;
    }
}


// ==========================================
// 3. ORDENS DE SERVIÇO
// ==========================================
const formOS = document.querySelector('#ordemServico');

if (formOS) {
    formOS.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectMaq = document.querySelector('#maquinaOS');

        if (!selectMaq.value) {
            document.querySelector('#ordem_servico').innerHTML =
                '⚠️ Selecione uma máquina válida antes de abrir a Ordem de Serviço.';
            return;
        }

        historicoOS.push({
            maquina:   selectMaq.value,
            descricao: document.querySelector('#descricaoOS').value,
            status:    document.querySelector('#statusOS').value,
            data:      new Date().toLocaleString('pt-BR')
        });

        document.querySelector('#ordem_servico').textContent = '🚀 Ordem de Serviço aberta com sucesso!';
        formOS.reset();
        exibirHistoricoOS();
    });
}

function exibirHistoricoOS() {
    const container = document.querySelector('#listaOS');
    if (!container) return;
    container.innerHTML = '';

    if (historicoOS.length === 0) {
        container.innerHTML = '<p style="color:#999; margin-top:12px;">Nenhuma ordem registrada ainda.</p>';
        return;
    }

    historicoOS.forEach(os => {
        const cor = os.status === 'concluido'    ? '#27ae60'
                  : os.status === 'em andamento' ? '#f39c12'
                  : '#e74c3c';

        container.innerHTML += `
            <div style="border:1px solid var(--mod-input-border,#ddd); padding:15px; margin-top:10px; border-radius:6px; position:relative; background:var(--mod-card-bg,white);">
                <span style="position:absolute; top:15px; right:15px; color:${cor}; font-weight:bold; font-size:0.8rem; text-transform:uppercase;">
                    ● ${os.status}
                </span>
                <strong>Equipamento:</strong> ${os.maquina}<br>
                <p style="margin:5px 0; color:var(--mod-label,#555);">${os.descricao}</p>
                <small style="color:#999;">Data: ${os.data}</small>
            </div>`;
    });
}

const btnConsultarOS = document.querySelector('#btnConsultarOS');
if (btnConsultarOS) {
    btnConsultarOS.addEventListener('click', exibirHistoricoOS);
}


// ==========================================
// EXPORTAÇÃO E IMPORTAÇÃO (EXCEL & PDF)
// ==========================================

// 1. Exportar para Excel (.xlsx)
function exportarExcel() {
    if (listaMaquinas.length === 0) {
        alert("Não há máquinas cadastradas para exportar.");
        return;
    }

    const wsMaquinas = XLSX.utils.json_to_sheet(listaMaquinas);
    const wb = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(wb, wsMaquinas, "Máquinas");

    if (historicoOS.length > 0) {
        const wsOS = XLSX.utils.json_to_sheet(historicoOS);
        XLSX.utils.book_append_sheet(wb, wsOS, "Ordens de Serviço");
    }

    XLSX.writeFile(wb, "Relatorio_Manutencao_MAP.xlsx");
}

// 2. Exportar para PDF (.pdf)
function exportarPDF() {
    if (listaMaquinas.length === 0) {
        alert("Não há máquinas cadastradas para exportar.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("M.A.P - Relatório de Máquinas e Equipamentos", 14, 15);
    doc.setFontSize(10);
    doc.text("Gerado em: " + new Date().toLocaleDateString(), 14, 22);

    const colunas = ["Nome da Máquina", "Modelo", "Número de Série", "Última Manutenção"];
    
    const linhas = listaMaquinas.map(m => [
        m.nome, 
        m.modelo, 
        m.serie, 
        formatarData(m.dataUltimaManutencao)
    ]);

    doc.autoTable({
        head: [colunas],
        body: linhas,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [6, 100, 215] }
    });

    doc.save("Relatorio_Manutencao_MAP.pdf");
}

// 3. Importar do Excel (.xlsx)
function importarExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});

            if (workbook.SheetNames.includes("Máquinas")) {
                const sheetMaquinas = workbook.Sheets["Máquinas"];
                const jsonMaquinas = XLSX.utils.sheet_to_json(sheetMaquinas);
                if (jsonMaquinas.length > 0) {
                    listaMaquinas = jsonMaquinas;
                }
            }

            if (workbook.SheetNames.includes("Ordens de Serviço")) {
                const sheetOS = workbook.Sheets["Ordens de Serviço"];
                const jsonOS = XLSX.utils.sheet_to_json(sheetOS);
                if (jsonOS.length > 0) {
                    historicoOS = jsonOS;
                }
            }

            if (typeof atualizarTabelaMaquinas === "function") atualizarTabelaMaquinas();
            if (typeof atualizarSelectMaquinas === "function") atualizarSelectMaquinas();
            if (typeof exibirHistoricoOS === "function") exibirHistoricoOS();
            
            alert("Dados importados com sucesso!");
        } catch (error) {
            alert("Erro ao ler o arquivo Excel. Certifique-se de que é um formato válido.");
            console.error(error);
        }
        
        event.target.value = "";
    };
    
    reader.readAsArrayBuffer(file);
}