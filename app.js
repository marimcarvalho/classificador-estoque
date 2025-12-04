// No final do arquivo, modificar a função setupEventListeners:

function setupEventListeners() {
    // Busca com debounce (só se o campo existir na página)
    if (elements.smartSearch) {
        elements.smartSearch.addEventListener(
            'input',
            utils.debounce(() => {
                state.filters.search = elements.smartSearch.value.trim();
                state.currentPage = 1;
                filterSystem.applyFilters();
                filterSystem.updateActiveFilters();
            }, CONFIG.DEBOUNCE_DELAY)
        );
    }
    
    // Filtros de categoria - verificar se existem
    const categoryFilters = document.querySelectorAll('.category-filters input');
    if (categoryFilters.length > 0) {
        categoryFilters.forEach(cb => {
            cb.addEventListener('change', () => {
                state.filters.categories = Array.from(document.querySelectorAll('.category-filters input:checked'))
                    .map(cb => cb.value);
                filterSystem.applyFilters();
            });
        });
    }
    
    // Filtros de faixa - verificar se existem
    if (elements.minQuantity) {
        elements.minQuantity.addEventListener('input', utils.debounce(() => {
            state.filters.minQuantity = elements.minQuantity.value ? parseFloat(elements.minQuantity.value) : null;
            filterSystem.applyFilters();
            filterSystem.updateActiveFilters();
        }, CONFIG.DEBOUNCE_DELAY));
    }
    
    if (elements.maxQuantity) {
        elements.maxQuantity.addEventListener('input', utils.debounce(() => {
            state.filters.maxQuantity = elements.maxQuantity.value ? parseFloat(elements.maxQuantity.value) : null;
            filterSystem.applyFilters();
            filterSystem.updateActiveFilters();
        }, CONFIG.DEBOUNCE_DELAY));
    }
    
    if (elements.minPrice) {
        elements.minPrice.addEventListener('input', utils.debounce(() => {
            state.filters.minPrice = elements.minPrice.value ? parseFloat(elements.minPrice.value) : null;
            filterSystem.applyFilters();
            filterSystem.updateActiveFilters();
        }, CONFIG.DEBOUNCE_DELAY));
    }
    
    if (elements.maxPrice) {
        elements.maxPrice.addEventListener('input', utils.debounce(() => {
            state.filters.maxPrice = elements.maxPrice.value ? parseFloat(elements.maxPrice.value) : null;
            filterSystem.applyFilters();
            filterSystem.updateActiveFilters();
        }, CONFIG.DEBOUNCE_DELAY));
    }
    
    // Ordenação - verificar se existe
    if (elements.sortBy) {
        elements.sortBy.addEventListener('change', () => {
            state.sortBy = elements.sortBy.value;
            filterSystem.applySorting();
        });
    }
    
    // Modo de visualização
    const viewButtons = document.querySelectorAll('.view-btn');
    if (viewButtons.length > 0) {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.viewMode = btn.dataset.view;
                displayManager.updateDisplay();
            });
        });
    }
}