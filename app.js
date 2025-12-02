/* ============================================================
   CLASSIFICADOR DE PRODUTOS - TUBOLUC
   Sistema de classificação automática de estoque
   Processamento 100% local no navegador
   ============================================================ */

/* -----------------------------------------------------------
   VARIÁVEIS GLOBAIS
----------------------------------------------------------- */
let produtos = [];
let produtosFiltrados = [];
let categoriaAtual = 'todos';
let auditoria = [];
let ordenacaoAtual = 'descricao';

/* -----------------------------------------------------------
   ELEMENTOS DOM
----------------------------------------------------------- */
const elementos = {
    // Elementos principais
    fileInput: document.getElementById('fileInput'),
    errorBox: document.getElementById('errorBox'),
    statsSection: document.getElementById('statsSection'),
    filterSection: document.getElementById('filterSection'),
    tabsSection: document.getElementById('tabsSection'),
    exportSection: document.getElementById('exportSection'),
    tableSection: document.getElementById('tableSection'),
    emptyState: document.getElementById('emptyState'),
    tableBody: document.getElementById('product-table-body'),
    noResults: document.getElementById('noResults'),
    
    // Elementos de filtro
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    resetFilters: document.getElementById('resetFilters'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    
    // Botões de ação
    toggleTheme: document.getElementById('toggleTheme'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    uploadBtn: document.getElementById('uploadBtn'),
    sampleDataBtn: document.getElementById('sampleDataBtn'),
    
    // Elementos de estatísticas
    countAcima10: document.getElementById('count_acima10'),
    countEntre5_10: document.getElementById('count_entre5_10'),
    countEntre1_5: document.getElementById('count_entre1_5'),
    countZerados: document.getElementById('count_zerados'),
    
    // Elementos de badges
    badgeTodos: document.getElementById('badge_todos'),
    badgeAcima10: document.getElementById('badge_acima10'),
    badgeEntre5_10: document.getElementById('badge_entre5_10'),
    badgeEntre1_5: document.getElementById('badge_entre1_5'),
    badgeZerados: document.getElementById('badge_zerados')
};

/* -----------------------------------------------------------
   FUNÇÕES DE UTILIDADE
----------------------------------------------------------- */
function mostrarErro(mensagem) {
    elementos.errorBox.textContent = mensagem;
    elementos.errorBox.classList.add('show');
    
    setTimeout(() => {
        elementos.errorBox.classList.remove('show');
    }, 5000);
}

function mostrarSucesso(mensagem) {
    // Cria um toast de sucesso temporário
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.textContent = '✅ ' + mensagem;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 12px 20px;
        border-radius: var(--radius);
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function toggleElementos(mostrar) {
    if (mostrar && produtos.length > 0) {
        elementos.statsSection.classList.remove('hidden');
        elementos.filterSection.classList.remove('hidden');
        elementos.tabsSection.classList.remove('hidden');
        elementos.exportSection.classList.remove('hidden');
        elementos.tableSection.classList.remove('hidden');
        elementos.emptyState.classList.add('hidden');
    } else {
        elementos.statsSection.classList.add('hidden');
        elementos.filterSection.classList.add('hidden');
        elementos.tabsSection.classList.add('hidden');
        elementos.exportSection.classList.add('hidden');
        elementos.tableSection.classList.add('hidden');
        elementos.emptyState.classList.remove('hidden');
    }
}

/* -----------------------------------------------------------
   PROCESSAMENTO DE ARQUIVO
----------------------------------------------------------- */
async function processarArquivo(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    const tiposValidos = ['.xlsx', '.xls', '.csv'];
    const extensao = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!tiposValidos.includes(extensao)) {
        mostrarErro(`Tipo de arquivo não suportado. Use: ${tiposValidos.join(', ')}`);
        return;
    }
    
    try {
        // Mostrar loading
        mostrarLoading('Processando arquivo...');
        
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const primeiraAba = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[primeiraAba];
        
        // Converter para JSON
        const linhas = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (linhas.length === 0) {
            throw new Error('O arquivo está vazio ou não contém dados válidos.');
        }
        
        // Normalizar os dados
        produtos = linhas.map((linha, index) => {
            // Encontrar colunas disponíveis
            const colunas = Object.keys(linha);
            
            // Mapear colunas comuns
            const produto = {
                id: index + 1,
                referencia: linha['referencia'] || linha['Referência'] || linha['REF'] || linha['Código'] || linha['COD'] || 'N/A',
                descricao: linha['descricao'] || linha['Descrição'] || linha['Produto'] || linha['Nome'] || linha['ITEM'] || 'Sem descrição',
                quantidade: parseFloat(linha['quantidade'] || linha['Quantidade'] || linha['Qtd'] || linha['Estoque'] || linha['qtdreal'] || linha['STOCK'] || 0),
                grupo: linha['grupo'] || linha['Grupo'] || linha['Categoria'] || linha['Departamento'] || linha['CATEGORY'] || 'Sem grupo',
                preco: parseFloat(linha['preco'] || linha['Preço'] || linha['Valor'] || linha['PU'] || linha['pumat'] || linha['PRICE'] || 0),
                ncm: linha['ncm'] || linha['NCM'] || '',
                codigoBarras: linha['codigo_barras'] || linha['Código Barras'] || linha['EAN'] || linha['barra'] || linha['BARCODE'] || '',
                unidade: linha['unidade'] || linha['Unidade'] || linha['UN'] || linha['UNIT'] || 'UN',
                fornecedor: linha['fornecedor'] || linha['Fornecedor'] || linha['SUPPLIER'] || ''
            };
            
            // Classificar categoria baseada na quantidade
            if (produto.quantidade > 10) {
                produto.categoria = 'acima10';
                produto.categoriaNome = 'Acima de 10';
                produto.corCategoria = 'green';
            } else if (produto.quantidade >= 5) {
                produto.categoria = 'entre5_10';
                produto.categoriaNome = 'Entre 5-10';
                produto.corCategoria = 'blue';
            } else if (produto.quantidade >= 1) {
                produto.categoria = 'entre1_5';
                produto.categoriaNome = 'Entre 1-5';
                produto.corCategoria = 'yellow';
            } else {
                produto.categoria = 'zerados';
                produto.categoriaNome = 'Zerados (≤1)';
                produto.corCategoria = 'red';
            }
            
            return produto;
        });
        
        // Salvar no localStorage
        salvarLocalStorage();
        
        // Atualizar interface
        atualizarEstatisticas();
        filtrarPorCategoria('todos');
        toggleElementos(true);
        
        mostrarSucesso(`${produtos.length} produtos carregados com sucesso!`);
        
    } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        mostrarErro(`Erro ao processar arquivo: ${error.message}`);
        
        // Restaurar empty state
        elementos.emptyState.innerHTML = `
            <div class="empty-state-content">
                <div class="empty-icon">❌</div>
                <h2 class="empty-title">Erro ao carregar arquivo</h2>
                <p class="empty-subtitle">${error.message}</p>
                <div class="empty-actions">
                    <button id="tryAgainBtn" class="btn btn-primary">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">Tentar Novamente</span>
                    </button>
                </div>
            </div>
        `;
        
        // Reatribuir event listener
        document.getElementById('tryAgainBtn').addEventListener('click', () => {
            location.reload();
        });
    }
}

function mostrarLoading(mensagem) {
    elementos.emptyState.innerHTML = `
        <div class="empty-state-content">
            <div class="loading loading-large"></div>
            <h2 class="empty-title">${mensagem}</h2>
            <p class="empty-subtitle">Por favor, aguarde enquanto os dados são carregados.</p>
        </div>
    `;
}

/* -----------------------------------------------------------
   ATUALIZAR ESTATÍSTICAS
----------------------------------------------------------- */
function atualizarEstatisticas() {
    if (produtos.length === 0) return;
    
    const acima10 = produtos.filter(p => p.categoria === 'acima10').length;
    const entre5_10 = produtos.filter(p => p.categoria === 'entre5_10').length;
    const entre1_5 = produtos.filter(p => p.categoria === 'entre1_5').length;
    const zerados = produtos.filter(p => p.categoria === 'zerados').length;
    
    // Atualizar contadores
    elementos.countAcima10.textContent = acima10;
    elementos.countEntre5_10.textContent = entre5_10;
    elementos.countEntre1_5.textContent = entre1_5;
    elementos.countZerados.textContent = zerados;
    
    // Atualizar badges
    elementos.badgeAcima10.textContent = acima10;
    elementos.badgeEntre5_10.textContent = entre5_10;
    elementos.badgeEntre1_5.textContent = entre1_5;
    elementos.badgeZerados.textContent = zerados;
    elementos.badgeTodos.textContent = produtos.length;
    
    // Animar estatísticas
    animarContador(elementos.countAcima10, 0, acima10, 1000);
    animarContador(elementos.countEntre5_10, 0, entre5_10, 1000);
    animarContador(elementos.countEntre1_5, 0, entre1_5, 1000);
    animarContador(elementos.countZerados, 0, zerados, 1000);
}

function animarContador(elemento, inicio, fim, duracao) {
    const incremento = (fim - inicio) / (duracao / 16);
    let valorAtual = inicio;
    
    const timer = setInterval(() => {
        valorAtual += incremento;
        if ((incremento > 0 && valorAtual >= fim) || (incremento < 0 && valorAtual <= fim)) {
            valorAtual = fim;
            clearInterval(timer);
        }
        elemento.textContent = Math.round(valorAtual);
    }, 16);
}

/* -----------------------------------------------------------
   FILTRAGEM E ORDENAÇÃO
----------------------------------------------------------- */
function filtrarPorCategoria(categoria) {
    categoriaAtual = categoria;
    
    // Atualizar abas ativas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('tab-active');
        tab.setAttribute('aria-selected', 'false');
    });
    
    const abaAtiva = document.querySelector(`.tab[data-tab="${categoria}"]`);
    if (abaAtiva) {
        abaAtiva.classList.add('tab-active');
        abaAtiva.setAttribute('aria-selected', 'true');
    }
    
    // Filtrar produtos
    if (categoria === 'todos') {
        produtosFiltrados = [...produtos];
    } else {
        produtosFiltrados = produtos.filter(p => p.categoria === categoria);
    }
    
    // Aplicar busca atual se houver
    const busca = elementos.searchInput.value.trim();
    if (busca) {
        produtosFiltrados = produtosFiltrados.filter(p => 
            p.referencia.toLowerCase().includes(busca.toLowerCase()) ||
            p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
            p.ncm.toLowerCase().includes(busca.toLowerCase()) ||
            p.grupo.toLowerCase().includes(busca.toLowerCase())
        );
    }
    
    // Ordenar
    ordenarTabela();
    
    // Atualizar tabela
    renderizarTabela();
    
    // Mostrar/ocultar mensagem de nenhum resultado
    if (produtosFiltrados.length === 0) {
        elementos.noResults.classList.remove('hidden');
    } else {
        elementos.noResults.classList.add('hidden');
    }
}

function filtrarTabela() {
    filtrarPorCategoria(categoriaAtual);
}

function ordenarTabela() {
    const criterio = elementos.sortSelect.value;
    ordenacaoAtual = criterio;
    
    if (!produtosFiltrados.length) return;
    
    produtosFiltrados.sort((a, b) => {
        switch (criterio) {
            case 'descricao':
                return a.descricao.localeCompare(b.descricao);
            case 'descricao_desc':
                return b.descricao.localeCompare(a.descricao);
            case 'quantidade':
                return b.quantidade - a.quantidade;
            case 'quantidade_desc':
                return a.quantidade - b.quantidade;
            case 'preco':
                return b.preco - a.preco;
            case 'preco_desc':
                return a.preco - b.preco;
            case 'referencia':
                return a.referencia.localeCompare(b.referencia);
            default:
                return 0;
        }
    });
    
    renderizarTabela();
}

function limparFiltros() {
    elementos.searchInput.value = '';
    elementos.sortSelect.value = 'descricao';
    filtrarPorCategoria('todos');
    mostrarSucesso('Filtros limpos com sucesso!');
}

/* -----------------------------------------------------------
   RENDERIZAR TABELA
----------------------------------------------------------- */
function renderizarTabela() {
    const tbody = elementos.tableBody;
    tbody.innerHTML = '';
    
    if (produtosFiltrados.length === 0) {
        return;
    }
    
    produtosFiltrados.forEach(produto => {
        const tr = document.createElement('tr');
        
        // Formatar valores
        const quantidadeFormatada = produto.quantidade.toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
        
        const precoFormatado = produto.preco.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        // Determinar classe do badge
        const badgeClass = `quantity-badge quantity-badge-${produto.corCategoria}`;
        
        tr.innerHTML = `
            <td class="th-reference">
                <strong class="ref-tooltip" title="${produto.referencia}">
                    ${produto.referencia}
                </strong>
                ${produto.codigoBarras ? `<br><small>${produto.codigoBarras}</small>` : ''}
            </td>
            <td class="th-description" title="${produto.descricao}">
                ${produto.descricao}
            </td>
            <td class="th-quantity">
                <span class="${badgeClass}">
                    ${quantidadeFormatada}
                </span>
            </td>
            <td class="th-category">
                <span style="color: var(--${produto.corCategoria}); font-weight: 600;">
                    ${produto.categoriaNome}
                </span>
            </td>
            <td class="th-group">${produto.grupo}</td>
            <td class="th-price">${precoFormatado}</td>
            <td class="th-actions">
                <button class="btn btn-primary" style="padding: 8px 16px; font-size: 14px;" 
                        onclick="editarProduto(${produto.id})" 
                        title="Editar produto">
                    ✏️ Editar
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/* -----------------------------------------------------------
   EDIÇÃO DE PRODUTOS
----------------------------------------------------------- */
function editarProduto(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;
    
    const novoQuantidade = prompt(`Editar quantidade para "${produto.descricao}":`, produto.quantidade);
    if (novoQuantidade === null) return;
    
    const quantidadeNum = parseFloat(novoQuantidade.replace(',', '.'));
    if (isNaN(quantidadeNum)) {
        mostrarErro('Quantidade inválida! Use números.');
        return;
    }
    
    // Registrar na auditoria
    auditoria.push({
        data: new Date().toISOString(),
        produtoId: produto.id,
        referencia: produto.referencia,
        acao: 'edicao_quantidade',
        valorAntigo: produto.quantidade,
        valorNovo: quantidadeNum,
        usuario: 'Sistema'
    });
    
    // Atualizar produto
    produto.quantidade = quantidadeNum;
    
    // Reclassificar categoria
    if (produto.quantidade > 10) {
        produto.categoria = 'acima10';
        produto.categoriaNome = 'Acima de 10';
        produto.corCategoria = 'green';
    } else if (produto.quantidade >= 5) {
        produto.categoria = 'entre5_10';
        produto.categoriaNome = 'Entre 5-10';
        produto.corCategoria = 'blue';
    } else if (produto.quantidade >= 1) {
        produto.categoria = 'entre1_5';
        produto.categoriaNome = 'Entre 1-5';
        produto.corCategoria = 'yellow';
    } else {
        produto.categoria = 'zerados';
        produto.categoriaNome = 'Zerados (≤1)';
        produto.corCategoria = 'red';
    }
    
    // Atualizar tudo
    salvarLocalStorage();
    atualizarEstatisticas();
    filtrarPorCategoria(categoriaAtual);
    
    mostrarSucesso(`Quantidade de "${produto.descricao}" atualizada para ${quantidadeNum}`);
}

/* -----------------------------------------------------------
   EXPORTAÇÃO
----------------------------------------------------------- */
function exportarCSV() {
    if (produtosFiltrados.length === 0) {
        mostrarErro('Nenhum dado para exportar!');
        return;
    }
    
    try {
        // Criar cabeçalhos
        const headers = ['Referência', 'Descrição', 'Quantidade', 'Categoria', 'Grupo', 'Preço', 'NCM', 'Código Barras', 'Unidade', 'Fornecedor'];
        
        // Criar linhas
        const linhas = produtosFiltrados.map(produto => [
            produto.referencia,
            `"${produto.descricao.replace(/"/g, '""')}"`,
            produto.quantidade,
            produto.categoriaNome,
            produto.grupo,
            produto.preco,
            produto.ncm,
            produto.codigoBarras,
            produto.unidade,
            produto.fornecedor
        ]);
        
        // Combinar tudo
        const conteudoCSV = [
            headers.join(','),
            ...linhas.map(linha => linha.join(','))
        ].join('\n');
        
        // Criar blob e download
        const blob = new Blob(['\uFEFF' + conteudoCSV], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `produtos_tuboluc_${categoriaAtual}_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        mostrarSucesso(`CSV exportado com ${produtosFiltrados.length} produtos!`);
        
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        mostrarErro('Erro ao exportar CSV: ' + error.message);
    }
}

/* -----------------------------------------------------------
   TEMA
----------------------------------------------------------- */
function toggleTheme() {
    const temaAtual = document.documentElement.getAttribute('data-theme');
    const novoTema = temaAtual === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', novoTema);
    localStorage.setItem('tema', novoTema);
    
    // Atualizar texto do botão
    const themeIcon = elementos.toggleTheme.querySelector('.theme-icon');
    const themeText = elementos.toggleTheme.querySelector('.theme-text');
    
    if (novoTema === 'dark') {
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Tema Claro';
    } else {
        themeIcon.textContent = '🌓';
        themeText.textContent = 'Tema Escuro';
    }
}

/* -----------------------------------------------------------
   LOCALSTORAGE
----------------------------------------------------------- */
function salvarLocalStorage() {
    try {
        const dados = {
            produtos: produtos,
            auditoria: auditoria,
            ultimaAtualizacao: new Date().toISOString(),
            versao: '1.0.0'
        };
        
        localStorage.setItem('tuboluc_classificador', JSON.stringify(dados));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
}

function carregarLocalStorage() {
    try {
        const dadosSalvos = localStorage.getItem('tuboluc_classificador');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            produtos = dados.produtos || [];
            auditoria = dados.auditoria || [];
            
            if (produtos.length > 0) {
                toggleElementos(true);
                atualizarEstatisticas();
                filtrarPorCategoria('todos');
                mostrarSucesso(`Carregados ${produtos.length} produtos do armazenamento local.`);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        // Se houver erro, limpar localStorage
        localStorage.removeItem('tuboluc_classificador');
        produtos = [];
    }
}

/* -----------------------------------------------------------
   DADOS DE EXEMPLO
----------------------------------------------------------- */
function carregarDadosExemplo() {
    const dadosExemplo = [
        {
            id: 1,
            referencia: "PROD001",
            descricao: "Parafuso Sextavado 10mm",
            quantidade: 15,
            grupo: "Ferragens",
            preco: 0.25,
            ncm: "73181500",
            codigoBarras: "7891234560010",
            unidade: "UN",
            fornecedor: "Fornecedor A",
            categoria: "acima10",
            categoriaNome: "Acima de 10",
            corCategoria: "green"
        },
        {
            id: 2,
            referencia: "PROD002",
            descricao: "Porca 10mm",
            quantidade: 8,
            grupo: "Ferragens",
            preco: 0.15,
            ncm: "73181600",
            codigoBarras: "7891234560027",
            unidade: "UN",
            fornecedor: "Fornecedor A",
            categoria: "entre5_10",
            categoriaNome: "Entre 5-10",
            corCategoria: "blue"
        },
        {
            id: 3,
            referencia: "PROD003",
            descricao: "Arruela 10mm",
            quantidade: 3,
            grupo: "Ferragens",
            preco: 0.08,
            ncm: "73182100",
            codigoBarras: "7891234560034",
            unidade: "UN",
            fornecedor: "Fornecedor B",
            categoria: "entre1_5",
            categoriaNome: "Entre 1-5",
            corCategoria: "yellow"
        },
        {
            id: 4,
            referencia: "PROD004",
            descricao: "Parafuso Allen 8mm",
            quantidade: 0,
            grupo: "Ferragens",
            preco: 0.45,
            ncm: "73181500",
            codigoBarras: "7891234560041",
            unidade: "UN",
            fornecedor: "Fornecedor C",
            categoria: "zerados",
            categoriaNome: "Zerados (≤1)",
            corCategoria: "red"
        },
        {
            id: 5,
            referencia: "PROD005",
            descricao: "Chave de Fenda 8x150mm",
            quantidade: 12,
            grupo: "Ferramentas",
            preco: 8.90,
            ncm: "82032000",
            codigoBarras: "7891234560058",
            unidade: "UN",
            fornecedor: "Fornecedor D",
            categoria: "acima10",
            categoriaNome: "Acima de 10",
            corCategoria: "green"
        },
        {
            id: 6,
            referencia: "PROD006",
            descricao: "Alicate Universal 8\"",
            quantidade: 6,
            grupo: "Ferramentas",
            preco: 24.90,
            ncm: "82032000",
            codigoBarras: "7891234560065",
            unidade: "UN",
            fornecedor: "Fornecedor D",
            categoria: "entre5_10",
            categoriaNome: "Entre 5-10",
            corCategoria: "blue"
        },
        {
            id: 7,
            referencia: "PROD007",
            descricao: "Martelo de Unha 500g",
            quantidade: 2,
            grupo: "Ferramentas",
            preco: 18.50,
            ncm: "82052000",
            codigoBarras: "7891234560072",
            unidade: "UN",
            fornecedor: "Fornecedor E",
            categoria: "entre1_5",
            categoriaNome: "Entre 1-5",
            corCategoria: "yellow"
        },
        {
            id: 8,
            referencia: "PROD008",
            descricao: "Nível de Bolha 60cm",
            quantidade: 0,
            grupo: "Ferramentas",
            preco: 32.90,
            ncm: "90158000",
            codigoBarras: "7891234560089",
            unidade: "UN",
            fornecedor: "Fornecedor F",
            categoria: "zerados",
            categoriaNome: "Zerados (≤1)",
            corCategoria: "red"
        },
        {
            id: 9,
            referencia: "PROD009",
            descricao: "Tinta Branca Fosco 1L",
            quantidade: 18,
            grupo: "Pintura",
            preco: 42.90,
            ncm: "32091000",
            codigoBarras: "7891234560096",
            unidade: "UN",
            fornecedor: "Fornecedor G",
            categoria: "acima10",
            categoriaNome: "Acima de 10",
            corCategoria: "green"
        },
        {
            id: 10,
            referencia: "PROD010",
            descricao: "Rolo de Pintura 20cm",
            quantidade: 7,
            grupo: "Pintura",
            preco: 12.90,
            ncm: "96034000",
            codigoBarras: "7891234560102",
            unidade: "UN",
            fornecedor: "Fornecedor H",
            categoria: "entre5_10",
            categoriaNome: "Entre 5-10",
            corCategoria: "blue"
        }
    ];
    
    produtos = dadosExemplo;
    salvarLocalStorage();
    atualizarEstatisticas();
    filtrarPorCategoria('todos');
    toggleElementos(true);
    
    mostrarSucesso('Dados de exemplo carregados com sucesso!');
}

/* -----------------------------------------------------------
   INICIALIZAÇÃO
----------------------------------------------------------- */
function inicializar() {
    // Configurar tema
    const temaSalvo = localStorage.getItem('tema') || 'light';
    document.documentElement.setAttribute('data-theme', temaSalvo);
    
    const themeIcon = elementos.toggleTheme.querySelector('.theme-icon');
    const themeText = elementos.toggleTheme.querySelector('.theme-text');
    
    if (temaSalvo === 'dark') {
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Tema Claro';
    } else {
        themeIcon.textContent = '🌓';
        themeText.textContent = 'Tema Escuro';
    }
    
    // Configurar event listeners
    elementos.toggleTheme.addEventListener('click', toggleTheme);
    elementos.resetFilters.addEventListener('click', limparFiltros);
    elementos.clearFiltersBtn.addEventListener('click', limparFiltros);
    elementos.exportCsvBtn.addEventListener('click', exportarCSV);
    elementos.uploadBtn.addEventListener('click', () => elementos.fileInput.click());
    elementos.sampleDataBtn.addEventListener('click', carregarDadosExemplo);
    
    // Configurar filtros
    elementos.searchInput.addEventListener('input', filtrarTabela);
    elementos.sortSelect.addEventListener('change', ordenarTabela);
    
    // Configurar upload
    elementos.fileInput.addEventListener('change', processarArquivo);
    
    // Configurar tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const categoria = tab.getAttribute('data-tab');
            filtrarPorCategoria(categoria);
        });
    });
    
    // Carregar dados salvos
    carregarLocalStorage();
    
    console.log('✅ Sistema Classificador de Produtos inicializado!');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}