import tkinter as tk
from tkinter import messagebox

# --- DADOS GLOBAIS (Simulação de Banco de Dados) ---
# Estes dados são globais e podem ser modificados por qualquer função.
MAQUINAS = [
    {"ID": "M001", "Nome": "Prensa 1 com um nome bem longo para testar o scroll X", "Setor": "Produção A", "Status": "✅ Operacional", "Freq": 30},
    {"ID": "M002", "Nome": "Linha de Montagem Modular V2.3", "Setor": "Produção B", "Status": "🛠️ Em Manutenção", "Freq": 60},
    {"ID": "M003", "Nome": "Compressor Central - Requer Atenção Urgente", "Setor": "Utilidades", "Status": "❌ Parada", "Freq": 90},
]

TECNICOS = [
    {"Matricula": "T001", "Nome": "João Silva", "Especialidade": "Mecânica"},
    {"Matricula": "T002", "Nome": "Maria Oliveira", "Especialidade": "Elétrica"},
]

HISTORICO = [
    {"Maquina": "Prensa 1 com um nome bem longo para testar o scroll X", "Data": "01/10/2025", "Tipo": "Preventiva", "Servico": "Troca de óleo e filtros de precisão", "Tecnico": "João Silva"},
    {"Maquina": "Linha de Montagem Modular V2.3", "Data": "25/09/2025", "Tipo": "Corretiva", "Servico": "Reparo no motor principal e realinhamento", "Tecnico": "Maria Oliveira"},
    {"Maquina": "Prensa 1 com um nome bem longo para testar o scroll X", "Data": "10/08/2025", "Tipo": "Corretiva", "Servico": "Ajuste de pressão", "Tecnico": "João Silva"},
]

# --- REFERÊNCIAS GLOBAIS PARA WIDGETS E TELAS ---
JANELA_PRINCIPAL = None 
TELA_LOGIN = None
TELA_GESTAO = None
PANELS = {}
CURRENT_PANEL = None # Usado para saber qual frame interno está visível
PERFIL_LOGADO = None # Armazena o perfil logado ("gestor" ou "tecnico")
GESTÃO_BUTTON_FRAME = None # Referência para o frame dos botões de navegação

# Entry fields do Login
MATRICULA_ENTRY = None
SENHA_ENTRY = None
SENHA_TOGGLE_BUTTON = None 

# Widgets da TelaGestao (para atualização)
TV_STATUS = None
HISTORICO_MAQUINA_ENTRY = None
TV_HISTORICO = None
MAQUINA_ENTRIES = {}
TECNICO_ENTRIES = {}

# Campos de OS
OS_MAQUINA_ENTRY = None
OS_TIPO_ENTRY = None
OS_TECNICO_ENTRY = None


# --- Funções Auxiliares ---
def listar_dados_em_listbox(listbox_widget, data_list, headers):
    """Limpa e preenche um Listbox com dados, formatando como string de largura fixa."""
    listbox_widget.delete(0, tk.END)
    col_width = 25 

    # Cria a linha de cabeçalho
    header_string = " | ".join(f"{h:<{col_width}}" for h in headers)
    listbox_widget.insert(tk.END, header_string)
    listbox_widget.insert(tk.END, "=" * (len(header_string) + 5)) 
    
    # Adiciona os dados (Lógica simplificada com .get e .strip)
    for item in data_list:
        # Acessa os valores da linha no dicionário
        values = [str(item.get(h, '')).strip() for h in headers]
        row_string = " | ".join(f"{v:<{col_width}}" for v in values)
        listbox_widget.insert(tk.END, row_string)

# --- Funções de Navegação e Lógica ---

def configurar_navegacao_gestao(perfil):
    """Configura os botões de navegação da TelaGestao baseados no perfil."""
    global GESTÃO_BUTTON_FRAME

    if GESTÃO_BUTTON_FRAME is None:
        return

    # Limpa todos os widgets existentes no frame de botões
    for widget in GESTÃO_BUTTON_FRAME.winfo_children():
        widget.destroy()

    # Padding maior para os botões de navegação
    button_padx = 10
    button_pady = 8

    if perfil == "gestor":
        # Botões do GESTOR (todos)
        tk.Button(GESTÃO_BUTTON_FRAME, text="Status das Máquinas", command=lambda: show_panel("frame_status")).pack(side="left", padx=button_padx, pady=button_pady)
        tk.Button(GESTÃO_BUTTON_FRAME, text="Gestão de O.S.", command=lambda: show_panel("frame_os")).pack(side="left", padx=button_padx, pady=button_pady)
        tk.Button(GESTÃO_BUTTON_FRAME, text="Cadastros", command=lambda: show_panel("frame_cadastro")).pack(side="left", padx=button_padx, pady=button_pady)
        tk.Button(GESTÃO_BUTTON_FRAME, text="Histórico", command=lambda: show_panel("frame_historico")).pack(side="left", padx=button_padx, pady=button_pady)
    
    elif perfil == "tecnico":
        # Botões do TÉCNICO (apenas Status e OS/Execução)
        tk.Button(GESTÃO_BUTTON_FRAME, text="Status das Máquinas", command=lambda: show_panel("frame_status")).pack(side="left", padx=button_padx, pady=button_pady)
        tk.Button(GESTÃO_BUTTON_FRAME, text="Executar O.S.", command=lambda: show_panel("frame_os")).pack(side="left", padx=button_padx, pady=button_pady)
        
    # Botão Logout (sempre no final)
    tk.Button(GESTÃO_BUTTON_FRAME, text="Logout", command=lambda: show_frame("TelaLogin"), bg="red", fg="white").pack(side="right", padx=15, pady=button_pady)


def show_frame(page_name):
    """Mostra uma tela específica e configura a navegação se for a Gestão."""
    global PERFIL_LOGADO
    frame = PANELS[page_name]
    frame.tkraise()
    
    # Lógica de atualização ao trocar de tela
    if page_name == "TelaGestao":
        configurar_navegacao_gestao(PERFIL_LOGADO)
        show_panel("frame_status") # Sempre começa em Status
    elif page_name == "TelaLogin":
        # Ao fazer logout, limpamos o perfil e a navegação da tela de gestão
        PERFIL_LOGADO = None
        configurar_navegacao_gestao(None)


def fazer_login():
    """Lógica de autenticação e definição do perfil (Atualizada)."""
    global MATRICULA_ENTRY, SENHA_ENTRY, PERFIL_LOGADO
    matricula = MATRICULA_ENTRY.get()
    senha = SENHA_ENTRY.get()
    
    if matricula == "gestor" and senha == "123":
        PERFIL_LOGADO = "gestor" # Define o perfil
        messagebox.showinfo("Sucesso", "Login de Gestor realizado!")
        show_frame("TelaGestao")
    elif matricula == "tecnico" and senha == "456":
        PERFIL_LOGADO = "tecnico" # Define o perfil
        messagebox.showinfo("Sucesso", "Login de Técnico realizado!")
        show_frame("TelaGestao") 
    else:
        PERFIL_LOGADO = None
        messagebox.showerror("Erro", "Matrícula ou senha incorreta.")

def show_panel(name):
    """Alterna a exibição dos painéis internos da TelaGestao."""
    global CURRENT_PANEL, PANELS
    frame = PANELS[name]
    frame.tkraise()
    CURRENT_PANEL = name
    
    # Atualiza o Listbox quando a tela de status/histórico é mostrada
    if name == "frame_status":
        atualizar_listbox_status()
    elif name == "frame_historico":
        atualizar_listbox_historico()

# --- Funções de Atualização de Dados (Mantidas) ---

def adicionar_maquina():
    """Função que pega os valores da máquina e adiciona à lista MAQUINAS"""
    global MAQUINA_ENTRIES, MAQUINAS, CURRENT_PANEL
    
    id_maquina = MAQUINA_ENTRIES["ID da Máquina"].get().strip()
    nome = MAQUINA_ENTRIES["Nome"].get().strip()
    setor = MAQUINA_ENTRIES["Setor"].get().strip()
    frequencia = MAQUINA_ENTRIES["Frequência (dias)"].get().strip()
    
    if id_maquina and nome and setor and frequencia.isdigit():
        nova_maquina = {
            "ID": id_maquina, 
            "Nome": nome, 
            "Setor": setor, 
            "Status": "✅ Operacional",
            "Freq": int(frequencia)
        }
        MAQUINAS.append(nova_maquina)
        messagebox.showinfo("Sucesso", f"Máquina '{nome}' adicionada com sucesso!")
        
        # Limpa os campos
        for entry in MAQUINA_ENTRIES.values():
            entry.delete(0, tk.END)
            
        # Atualiza a lista de status
        if CURRENT_PANEL == "frame_status":
            atualizar_listbox_status()
    else:
        messagebox.showerror("Erro", "Preencha todos os campos e a Frequência deve ser um número inteiro.")

def adicionar_tecnico():
    """Função que pega os valores do técnico e adiciona à lista TECNICOS"""
    global TECNICO_ENTRIES, TECNICOS
    nome = TECNICO_ENTRIES["Nome"].get().strip()
    matricula = TECNICO_ENTRIES["Matrícula"].get().strip()
    especialidade = TECNICO_ENTRIES["Especialidade"].get().strip()
    
    if nome and matricula and especialidade:
        novo_tecnico = {
            "Nome": nome,
            "Matricula": matricula,
            "Especialidade": especialidade
        }
        TECNICOS.append(novo_tecnico)
        messagebox.showinfo("Sucesso", f"Técnico '{nome}' adicionado com sucesso!")
        
        # Limpa os campos
        for entry in TECNICO_ENTRIES.values():
            entry.delete(0, tk.END)
    else:
        messagebox.showerror("Erro", "Preencha todos os campos do Técnico.")

def criar_nova_os():
    """Função que pega os valores e registra a OS (apenas simulação)"""
    global OS_MAQUINA_ENTRY, OS_TIPO_ENTRY, OS_TECNICO_ENTRY, HISTORICO, MAQUINAS
    
    maquina_id = OS_MAQUINA_ENTRY.get().strip()
    tipo = OS_TIPO_ENTRY.get().strip()
    tecnico = OS_TECNICO_ENTRY.get().strip()
    
    if maquina_id and tipo and tecnico:
        novo_id = f"OS{len(HISTORICO) + 1:03d}"
        maquina_nome = next((m['Nome'] for m in MAQUINAS if m['ID'] == maquina_id), "Máquina Desconhecida")
        
        HISTORICO.append({
            "Maquina": maquina_nome, 
            "Data": "Hoje", 
            "Tipo": tipo, 
            "Servico": "Nova OS Aberta", 
            "Tecnico": tecnico
        })

        messagebox.showinfo("Ação", f"Nova OS Criada: {novo_id}\nMáquina: {maquina_nome}, Tipo: {tipo}, Técnico: {tecnico}. (Adicionado ao Histórico)")
        
        # Limpa os campos após a 'criação'
        OS_MAQUINA_ENTRY.delete(0, tk.END)
        OS_TIPO_ENTRY.delete(0, tk.END)
        OS_TECNICO_ENTRY.delete(0, tk.END)
        
    else:
        messagebox.showwarning("Aviso", "Preencha todos os campos da OS.")

def atualizar_listbox_status():
    """Atualiza o Listbox de Status das Máquinas."""
    global TV_STATUS, MAQUINAS
    headers = ["ID", "Nome", "Setor", "Status"]
    data_to_display = [{"ID": m['ID'], "Nome": m['Nome'], "Setor": m['Setor'], "Status": m['Status']} for m in MAQUINAS]
    listar_dados_em_listbox(TV_STATUS, data_to_display, headers)

def atualizar_listbox_historico():
    """Atualiza o Listbox de Histórico, filtrando pela Máquina selecionada."""
    global HISTORICO_MAQUINA_ENTRY, TV_HISTORICO, HISTORICO, MAQUINAS
    
    maquina_id_filtro = HISTORICO_MAQUINA_ENTRY.get().strip()
    headers = ["Maquina", "Data", "Tipo", "Servico", "Tecnico"]
    data_filtrada = []
    
    if maquina_id_filtro:
        maquina_nome_filtro = next((m['Nome'] for m in MAQUINAS if m['ID'] == maquina_id_filtro), None)
        
        if maquina_nome_filtro:
            data_filtrada = [h for h in HISTORICO if h.get("Maquina") == maquina_nome_filtro]
        else:
            # Não exibe mensagem de erro aqui, apenas não filtra (ou exibe vazio)
            pass
    else:
        data_filtrada = HISTORICO # Exibe tudo se não houver filtro
    
    listar_dados_em_listbox(TV_HISTORICO, data_filtrada, headers)

def toggle_senha():
    """Alterna entre mostrar e esconder a senha no campo de login."""
    global SENHA_ENTRY, SENHA_TOGGLE_BUTTON
    
    # Se a senha estiver escondida ('*'), mostra ('')
    if SENHA_ENTRY['show'] == '*':
        SENHA_ENTRY.config(show='')
        SENHA_TOGGLE_BUTTON.config(text="👁️ Esconder")
    # Se a senha estiver visível (''), esconde ('*')
    else:
        SENHA_ENTRY.config(show='*')
        SENHA_TOGGLE_BUTTON.config(text="👁️ Mostrar")

# --- Funções de Construção das Telas (Atualizadas com mais padding) ---

def criar_tela_login(container):
    """Cria e configura a tela de Login (Aumentado o espaçamento vertical)."""
    global TELA_LOGIN, MATRICULA_ENTRY, SENHA_ENTRY, SENHA_TOGGLE_BUTTON
    
    # Aumentando padding do frame principal para 50 vertical
    TELA_LOGIN = tk.Frame(container, padx=40, pady=50) 
    
    # Aumentando pady do Título para 30
    tk.Label(TELA_LOGIN, text="Login do Sistema", font=("Arial", 18, "bold")).grid(row=0, column=0, columnspan=2, pady=30) 
    
    # Dicas de Login
    tk.Label(TELA_LOGIN, text="Gestor: matricula=gestor, senha=123", fg="blue").grid(row=0, column=2, padx=15, sticky="w")
    tk.Label(TELA_LOGIN, text="Técnico: matricula=tecnico, senha=456", fg="green").grid(row=1, column=2, padx=15, sticky="w")

    # Campo Matrícula
    tk.Label(TELA_LOGIN, text="Matrícula:").grid(row=1, column=0, sticky="w", pady=10, padx=5)
    MATRICULA_ENTRY = tk.Entry(TELA_LOGIN, width=30)
    MATRICULA_ENTRY.grid(row=1, column=1, pady=10, padx=5)

    # Campo Senha
    tk.Label(TELA_LOGIN, text="Senha:").grid(row=2, column=0, sticky="w", pady=10, padx=5)
    
    # Frame para agrupar o campo de senha e o botão de toggle
    senha_container_frame = tk.Frame(TELA_LOGIN)
    senha_container_frame.grid(row=2, column=1, sticky="w", pady=10, padx=5)
    
    SENHA_ENTRY = tk.Entry(senha_container_frame, width=22, show="*") 
    SENHA_ENTRY.pack(side="left", fill="x")

    # Botão de Mostrar/Esconder Senha
    SENHA_TOGGLE_BUTTON = tk.Button(senha_container_frame, text="👁️ Mostrar", command=toggle_senha, width=15)
    SENHA_TOGGLE_BUTTON.pack(side="left", padx=(10, 5)) 

    # Botão Login - Aumentado o pady para 35 para dar mais espaço
    tk.Button(TELA_LOGIN, text="Login", command=fazer_login, width=20, bg="#0066cc", fg="white").grid(row=3, column=0, columnspan=2, pady=35)
    
    return TELA_LOGIN

def criar_tela_gestao(container):
    """Cria e configura o Painel de Gestão (Refatorado para navegação dinâmica)."""
    global TELA_GESTAO, PANELS, GESTÃO_BUTTON_FRAME
    
    TELA_GESTAO = tk.Frame(container)
    
    # Aumentado pady do Título
    tk.Label(TELA_GESTAO, text="Painel de Gestão de Manutenção", font=("Arial", 20, "bold")).pack(pady=25) 

    # Botões de Navegação - Este frame será preenchido dinamicamente após o login
    GESTÃO_BUTTON_FRAME = tk.Frame(TELA_GESTAO)
    GESTÃO_BUTTON_FRAME.pack(fill="x", padx=15) 
    
    # Container para os Painéis internos
    panel_container = tk.Frame(TELA_GESTAO)
    panel_container.pack(pady=15, padx=15, expand=True, fill="both") 
    panel_container.grid_rowconfigure(0, weight=1)
    panel_container.grid_columnconfigure(0, weight=1)

    # Cria e armazena os painéis internos
    frame_status = criar_dashboard_status(panel_container)
    frame_os = criar_gestao_os(panel_container)
    frame_cadastro = criar_cadastros(panel_container)
    frame_historico = criar_historico(panel_container)
    
    PANELS["frame_status"] = frame_status
    PANELS["frame_os"] = frame_os
    PANELS["frame_cadastro"] = frame_cadastro
    PANELS["frame_historico"] = frame_historico

    # Posiciona todos no mesmo lugar
    for frame in [frame_status, frame_os, frame_cadastro, frame_historico]:
        frame.grid(row=0, column=0, sticky="nsew")

    return TELA_GESTAO

def criar_dashboard_status(parent_frame):
    """Cria o painel de status das máquinas, com scroll horizontal (Aumentado o espaçamento)."""
    global TV_STATUS
    frame = tk.Frame(parent_frame, padx=10, pady=10)
    
    # Aumentado pady
    tk.Label(frame, text="✅ Operacional | 🛠️ Em Manutenção | ❌ Parada", font=("Arial", 12, "bold")).pack(pady=20) 
    tk.Label(frame, text="🚨 ALERTA: Manutenção Preventiva Vencendo! (Máquina X)", fg="red", font=("Arial", 10, "bold")).pack(pady=8) 
    tk.Label(frame, text="Status das Máquinas (Listbox):", font=("Arial", 11, "bold")).pack(pady=10) 
    
    # --- Container do Listbox com Scrollbars ---
    listbox_container = tk.Frame(frame)
    listbox_container.pack(expand=True, fill="both", padx=15, pady=15) 

    v_scrollbar = tk.Scrollbar(listbox_container, orient=tk.VERTICAL)
    v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    h_scrollbar = tk.Scrollbar(listbox_container, orient=tk.HORIZONTAL)
    h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
    
    TV_STATUS = tk.Listbox(
        listbox_container, 
        height=10, 
        font=("Courier", 10),
        yscrollcommand=v_scrollbar.set,
        xscrollcommand=h_scrollbar.set 
    )
    TV_STATUS.pack(expand=True, fill="both", side=tk.LEFT)
    
    v_scrollbar.config(command=TV_STATUS.yview)
    h_scrollbar.config(command=TV_STATUS.xview)
    
    return frame

def criar_gestao_os(parent_frame):
    """Cria o painel de gestão de ordens de serviço (Aumentado o espaçamento)."""
    global OS_MAQUINA_ENTRY, OS_TIPO_ENTRY, OS_TECNICO_ENTRY
    frame = tk.Frame(parent_frame, padx=10, pady=10)
    
    # Aumentado pady do Título
    tk.Label(frame, text="**Criação/Execução de Ordem de Serviço**", font=("Arial", 16, "bold")).pack(pady=25) 
    
    # Bloco de formulário
    form_frame = tk.Frame(frame)
    form_frame.pack(pady=10, padx=20) 
    
    # Itens do formulário com pady e padx aumentados
    tk.Label(form_frame, text="Máquina (ID):").grid(row=0, column=0, sticky="w", padx=10, pady=10)
    OS_MAQUINA_ENTRY = tk.Entry(form_frame, width=30)
    OS_MAQUINA_ENTRY.grid(row=0, column=1, padx=10, pady=10)
    OS_MAQUINA_ENTRY.insert(0, MAQUINAS[0]['ID'] if MAQUINAS else "")

    tk.Label(form_frame, text="Tipo de OS:").grid(row=1, column=0, sticky="w", padx=10, pady=10)
    OS_TIPO_ENTRY = tk.Entry(form_frame, width=30)
    OS_TIPO_ENTRY.grid(row=1, column=1, padx=10, pady=10)
    OS_TIPO_ENTRY.insert(0, "Preventiva")

    tk.Label(form_frame, text="Técnico (Matrícula):").grid(row=2, column=0, sticky="w", padx=10, pady=10)
    OS_TECNICO_ENTRY = tk.Entry(form_frame, width=30)
    OS_TECNICO_ENTRY.grid(row=2, column=1, padx=10, pady=10)
    OS_TECNICO_ENTRY.insert(0, TECNICOS[0]['Matricula'] if TECNICOS else "")

    # Botão
    tk.Button(form_frame, text="Criar/Executar OS", command=criar_nova_os, bg="#339933", fg="white").grid(row=3, column=0, columnspan=2, pady=20) # Aumentado pady

    tk.Label(frame, text="**OS em Aberto/Andamento (Listbox)**", font=("Arial", 14, "bold")).pack(pady=15) 
    
    # Listbox de OS Abertas
    tv_os_abertas = tk.Listbox(frame, height=10, font=("Courier", 10))
    tv_os_abertas.pack(expand=True, fill="both", padx=15, pady=15) 
    
    # Preenchimento inicial (Mock)
    listar_dados_em_listbox(tv_os_abertas, [
        {"OS": "OS001", "Maquina": "M002", "Tipo": "Corretiva", "Status": "Em Andamento"},
        {"OS": "OS002", "Maquina": "M001", "Tipo": "Preventiva", "Status": "Aguardando"}
    ], ["OS", "Maquina", "Tipo", "Status"])
    
    return frame

def criar_cadastros(parent_frame):
    """Cria o painel de cadastro de máquinas e técnicos (Aumentado o espaçamento)."""
    global MAQUINA_ENTRIES, TECNICO_ENTRIES
    frame = tk.Frame(parent_frame, padx=20, pady=20)
    
    # Aumentado pady do Título
    tk.Label(frame, text="**Cadastro de Máquinas**", font=("Arial", 16, "bold")).pack(pady=15) 
    
    form_maquina = tk.Frame(frame)
    form_maquina.pack(pady=10, padx=10) 
    
    campos_maquina = ["ID da Máquina:", "Nome:", "Setor:", "Frequência (dias):"]
    
    for i, campo in enumerate(campos_maquina):
        tk.Label(form_maquina, text=campo).grid(row=i, column=0, sticky="w", padx=10, pady=8) 
        entry = tk.Entry(form_maquina, width=40)
        entry.grid(row=i, column=1, padx=10, pady=8) 
        MAQUINA_ENTRIES[campo.replace(":", "").strip()] = entry
            
    tk.Button(form_maquina, text="Adicionar Máquina", command=adicionar_maquina).grid(row=len(campos_maquina), column=0, columnspan=2, pady=20) # Aumentado pady
    
    # Separador visual
    tk.Frame(frame, height=2, bd=1, relief=tk.SUNKEN).pack(fill="x", padx=20, pady=30) # Aumentado pady

    # --- Cadastro de Técnicos ---
    # Aumentado pady do Título
    tk.Label(frame, text="**Cadastro de Técnicos**", font=("Arial", 16, "bold")).pack(pady=15) 
    
    form_tecnico = tk.Frame(frame)
    form_tecnico.pack(pady=10, padx=10) 
    
    campos_tecnico = ["Nome:", "Matrícula:", "Especialidade:"]
    
    for i, campo in enumerate(campos_tecnico):
        tk.Label(form_tecnico, text=campo).grid(row=i, column=0, sticky="w", padx=10, pady=8) 
        entry = tk.Entry(form_tecnico, width=40)
        entry.grid(row=i, column=1, padx=10, pady=8) 
        TECNICO_ENTRIES[campo.replace(":", "").strip()] = entry
            
    tk.Button(form_tecnico, text="Adicionar Técnico", command=adicionar_tecnico).grid(row=len(campos_tecnico), column=0, columnspan=2, pady=20) # Aumentado pady
    
    return frame

def criar_historico(parent_frame):
    """Cria o painel de histórico de manutenção, com scroll horizontal (Aumentado o espaçamento)."""
    global HISTORICO_MAQUINA_ENTRY, TV_HISTORICO
    frame = tk.Frame(parent_frame, padx=10, pady=10)
    
    # Aumentado pady do Título
    tk.Label(frame, text="**Consulta de Histórico por Máquina**", font=("Arial", 16, "bold")).pack(pady=25) 
    
    tk.Label(frame, text="Máquina (ID para Filtrar):").pack(pady=10) 
    HISTORICO_MAQUINA_ENTRY = tk.Entry(frame, width=30)
    HISTORICO_MAQUINA_ENTRY.pack(pady=10) # Aumentado pady
    HISTORICO_MAQUINA_ENTRY.insert(0, MAQUINAS[0]['ID'] if MAQUINAS else "")
    
    tk.Button(frame, text="Buscar Histórico", command=atualizar_listbox_historico).pack(pady=20) # Aumentado pady

    # --- Container do Listbox com Scrollbars ---
    listbox_container = tk.Frame(frame)
    listbox_container.pack(expand=True, fill="both", padx=15, pady=15) 
    
    v_scrollbar = tk.Scrollbar(listbox_container, orient=tk.VERTICAL)
    v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    h_scrollbar = tk.Scrollbar(listbox_container, orient=tk.HORIZONTAL)
    h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)

    TV_HISTORICO = tk.Listbox(
        listbox_container, 
        height=10, 
        font=("Courier", 10),
        yscrollcommand=v_scrollbar.set,
        xscrollcommand=h_scrollbar.set # Scroll Horizontal
    )
    TV_HISTORICO.pack(expand=True, fill="both", side=tk.LEFT)
    
    v_scrollbar.config(command=TV_HISTORICO.yview)
    h_scrollbar.config(command=TV_HISTORICO.xview)
    
    return frame


# --- Configuração e Inicialização da Aplicação ---

def iniciar_app():
    """Função principal para configurar a janela e iniciar o loop."""
    global JANELA_PRINCIPAL, TELA_LOGIN, TELA_GESTAO, PANELS 
    
    JANELA_PRINCIPAL = tk.Tk() # Instância da janela principal
    JANELA_PRINCIPAL.title("Sistema de Manutenção - Perfis de Acesso")
    JANELA_PRINCIPAL.geometry("950x700") # Janela um pouco maior para o novo layout

    # Container principal onde as telas serão empilhadas
    container = tk.Frame(JANELA_PRINCIPAL)
    container.pack(side="top", fill="both", expand=True)
    container.grid_rowconfigure(0, weight=1)
    container.grid_columnconfigure(0, weight=1)

    # Criação das Telas
    TELA_LOGIN = criar_tela_login(container)
    TELA_GESTAO = criar_tela_gestao(container)
    
    PANELS["TelaLogin"] = TELA_LOGIN
    PANELS["TelaGestao"] = TELA_GESTAO
    
    # Posiciona todas as telas no mesmo lugar
    TELA_LOGIN.grid(row=0, column=0, sticky="nsew")
    TELA_GESTAO.grid(row=0, column=0, sticky="nsew")

    show_frame("TelaLogin") # Começa na tela de Login
    
    JANELA_PRINCIPAL.mainloop() # Inicia o loop

if __name__ == "__main__":
    iniciar_app()