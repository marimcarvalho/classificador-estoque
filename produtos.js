// produtos.js
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateStats();
    setupEventListeners();
});

function loadProducts() {
    const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
    const products = data.produtos;

    // Atualiza contador de produtos, se a função existir
    if (typeof updateProductCount === 'function') {
        updateProductCount(products.length);
    }

    // Renderiza tabela principal
    renderTable(products);

    // Se no futuro implementar visualização em cards, reative a linha abaixo
    // renderCards(products);

    // Atualiza filtros (categorias, fornecedores etc.)
    updateFilters(products);
}

function renderTable(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        document.getElementById('noResults').classList.remove('hidden');
        document.getElementById('tableView').classList.add('hidden');
        return;
    }
    
    products.forEach((product, index) => {
        const row = document.createElement('tr');
        
        // Categoria com base na quantidade
        let category = 'acima10';
        if (product.quantidade === 0) category = 'zerados';
        else if (product.quantidade <= 5) category = 'entre1_5';
        else if (product.quantidade <= 10) category = 'entre5_10';
        
        // Valor total
        const valorTotal = (product.quantidade * (product.preco || 0)).toFixed(2);
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="product-checkbox" data-id="${index}">
            </td>
            <td>
                <strong>${product.referencia || 'N/A'}</strong>
            </td>
            <td>${product.descricao || ''}</td>
            <td>
                <span class="category-badge category-${category}">
                    ${getCategoryLabel(category)}
                </span>
            </td>
            <td>
                <div class="quantity-display">
                    <span class="quantity-value ${product.quantidade <= 5 ? 'low-stock' : ''}">
                        ${product.quantidade}
                    </span>
                </div>
            </td>
            <td>R$ ${(product.preco || 0).toFixed(2)}</td>
            <td>
                <strong>R$ ${valorTotal}</strong>
            </td>
            <td>${product.fornecedor || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-sm" onclick="editProduct(${index})" 
                            aria-label="Editar produto">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-sm btn-danger" onclick="deleteProduct(${index})" 
                            aria-label="Excluir produto">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon btn-sm btn-info" onclick="viewDetails(${index})" 
                            aria-label="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function getCategoryLabel(category) {
    const labels = {
        'acima10': 'Acima de 10',
        'entre5_10': 'Entre 5-10',
        'entre1_5': 'Entre 1-5',
        'zerados': 'Zerados'
    };
    return labels[category] || category;
}

function updateStats() {
    const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
    const products = data.produtos;
    
    // Calcular totais
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.quantidade * (p.preco || 0)), 0);
    const lowStock = products.filter(p => p.quantidade <= 5 && p.quantidade > 0).length;
    const categories = [...new Set(products.map(p => p.categoria).filter(Boolean))].length;
    
    // Atualizar elementos
    document.getElementById('totalProdutos').textContent = totalProducts;
    document.getElementById('valorTotal').textContent = `R$ ${totalValue.toFixed(2)}`;
    document.getElementById('produtosBaixos').textContent = lowStock;
    document.getElementById('categorias').textContent = categories;
    document.getElementById('prodCountMenu').textContent = totalProducts;
    
    // Atualizar contagem de alertas
    const zeroStock = products.filter(p => p.quantidade === 0).length;
    document.getElementById('alertCountMenu').textContent = zeroStock + lowStock;
}

function updateProductCount() {
  // A contagem de produtos pode ser atualizada pelo app.js ou em outro ponto.
}

// FUNÇÕES NOVAS ADICIONADAS:
function updateFilters(products) {
    const categories = [...new Set(products.map(p => {
        if (p.quantidade > 10) return 'acima10';
        if (p.quantidade >= 5) return 'entre5_10';
        if (p.quantidade >= 1) return 'entre1_5';
        return 'zerados';
    }).filter(Boolean))];
    
    const suppliers = [...new Set(products.map(p => p.fornecedor).filter(Boolean))];
    
    // Atualizar filtro de categorias
    const categoryFilter = document.getElementById('filterCategory');
    if (categoryFilter) {
        const currentValue = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="">Todas categorias</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = getCategoryLabel(cat);
            if (cat === currentValue) option.selected = true;
            categoryFilter.appendChild(option);
        });
    }
    
    // Atualizar filtro de fornecedores
    const supplierFilter = document.getElementById('filterSupplier');
    if (supplierFilter) {
        const currentValue = supplierFilter.value;
        supplierFilter.innerHTML = '<option value="">Todos fornecedores</option>';
        suppliers.forEach(supp => {
            const option = document.createElement('option');
            option.value = supp;
            option.textContent = supp;
            if (supp === currentValue) option.selected = true;
            supplierFilter.appendChild(option);
        });
    }
}

function setupEventListeners() {
    // Configurar listeners para os filtros
    const searchProducts = document.getElementById('searchProducts');
    const filterCategory = document.getElementById('filterCategory');
    const filterSupplier = document.getElementById('filterSupplier');
    const filterStock = document.getElementById('filterStock');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    if (searchProducts) {
        searchProducts.addEventListener('input', function(e) {
            filterProducts();
        });
    }
    
    if (filterCategory) {
        filterCategory.addEventListener('change', filterProducts);
    }
    
    if (filterSupplier) {
        filterSupplier.addEventListener('change', filterProducts);
    }
    
    if (filterStock) {
        filterStock.addEventListener('change', filterProducts);
    }
    
    if (minPrice) {
        minPrice.addEventListener('input', filterProducts);
    }
    
    if (maxPrice) {
        maxPrice.addEventListener('input', filterProducts);
    }
    
    // Configurar botões de ação
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function(e) {
            const checkboxes = document.querySelectorAll('.product-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }
}

function filterProducts() {
    const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
    let filtered = data.produtos;
    
    // Filtro de busca
    const searchTerm = document.getElementById('searchProducts')?.value.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(product => 
            (product.referencia && product.referencia.toLowerCase().includes(searchTerm)) ||
            (product.descricao && product.descricao.toLowerCase().includes(searchTerm)) ||
            (product.fornecedor && product.fornecedor.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filtro de categoria
    const category = document.getElementById('filterCategory')?.value;
    if (category) {
        filtered = filtered.filter(product => {
            let cat = 'acima10';
            if (product.quantidade === 0) cat = 'zerados';
            else if (product.quantidade <= 5) cat = 'entre1_5';
            else if (product.quantidade <= 10) cat = 'entre5_10';
            return cat === category;
        });
    }
    
    // Filtro de fornecedor
    const supplier = document.getElementById('filterSupplier')?.value;
    if (supplier) {
        filtered = filtered.filter(product => product.fornecedor === supplier);
    }
    
    // Filtro de estoque
    const stock = document.getElementById('filterStock')?.value;
    if (stock) {
        filtered = filtered.filter(product => {
            if (stock === 'high') return product.quantidade > 10;
            if (stock === 'medium') return product.quantidade >= 5 && product.quantidade <= 10;
            if (stock === 'low') return product.quantidade >= 1 && product.quantidade < 5;
            if (stock === 'zero') return product.quantidade === 0;
            return true;
        });
    }
    
    // Filtro de preço
    const minPriceVal = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPriceVal = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
    
    if (minPriceVal > 0 || maxPriceVal < Infinity) {
        filtered = filtered.filter(product => {
            const price = product.preco || 0;
            return price >= minPriceVal && price <= maxPriceVal;
        });
    }
    
    // Atualizar contadores
    document.getElementById('showingCount').textContent = filtered.length;
    document.getElementById('totalCount').textContent = data.produtos.length;
    
    // Renderizar tabela filtrada
    renderTable(filtered);
}

function resetFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterSupplier').value = '';
    document.getElementById('filterStock').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('searchProducts').value = '';
    
    // Recarregar produtos sem filtros
    loadProducts();
    
    // Atualizar contadores
    const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
    document.getElementById('showingCount').textContent = data.produtos.length;
    document.getElementById('totalCount').textContent = data.produtos.length;
}

// Funções auxiliares para os botões (placeholders)
function editProduct(index) {
    alert(`Editar produto ${index} - Funcionalidade em desenvolvimento`);
}

function deleteProduct(index) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
        data.produtos.splice(index, 1);
        localStorage.setItem('tubolucData', JSON.stringify(data));
        loadProducts();
        updateStats();
    }
}

function viewDetails(index) {
    const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
    const product = data.produtos[index];
    alert(`Detalhes do produto:\n\nReferência: ${product.referencia}\nDescrição: ${product.descricao}\nQuantidade: ${product.quantidade}\nPreço: R$ ${product.preco}\nFornecedor: ${product.fornecedor}`);
}