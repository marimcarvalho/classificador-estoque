// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.log('Chart.js não disponível - gráficos desativados');
        showChartErrorMessages();
        return;
    }
    
    // Inicializar dashboard
    initDashboard();
    updateDashboardStats();
    
    // Atualizar data/hora
    updateDateTime();
    setInterval(updateDateTime, 60000);
});

function initDashboard() {
    // Configurar event listeners
    const distribuicaoFilter = document.getElementById('distribuicaoFilter');
    if (distribuicaoFilter) {
        distribuicaoFilter.addEventListener('change', function() {
            updateCharts();
        });
    }
    
    // Inicializar gráficos
    updateCharts();
    updateRecentProducts();
    updatePriorityAlerts();
}

function updateDashboardStats() {
    const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
    const products = data.produtos;
    
    // KPIs
    document.getElementById('kpiTotal').textContent = products.length;
    
    const totalValue = products.reduce((sum, p) => sum + (p.quantidade * (p.preco || 0)), 0);
    document.getElementById('kpiTotalValue').textContent = formatCurrency(totalValue);
    
    const criticalProducts = products.filter(p => p.quantidade <= 1).length;
    document.getElementById('kpiCritical').textContent = criticalProducts;
    
    const uniqueGroups = [...new Set(products.map(p => p.grupo || p.categoria).filter(Boolean))].length;
    document.getElementById('kpiGroups').textContent = uniqueGroups;
    
    // Atualizar menu
    document.getElementById('prodCountMenu').textContent = products.length;
    document.getElementById('alertCountMenu').textContent = criticalProducts;
    
    // Atualizar footer
    document.getElementById('lastUpdate').textContent = `Última atualização: ${new Date().toLocaleString('pt-BR')}`;
}

function updateCharts() {
    if (typeof Chart === 'undefined') return;
    
    const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
    const products = data.produtos;
    
    // Gráfico de distribuição
    updateDistributionChart(products);
    
    // Gráfico top 10
    updateTop10Chart(products);
}

function updateDistributionChart(products) {
    const ctx = document.getElementById('chartDistribuicao');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    // Calcular distribuição
    const categories = {
        acima10: 0,
        entre5_10: 0,
        entre1_5: 0,
        zerados: 0
    };
    
    products.forEach(product => {
        const qty = product.quantidade || 0;
        if (qty > 10) categories.acima10++;
        else if (qty >= 5) categories.entre5_10++;
        else if (qty >= 1) categories.entre1_5++;
        else categories.zerados++;
    });
    
    const filterType = document.getElementById('distribuicaoFilter')?.value || 'quantidade';
    
    // Se for por valor, calcular valor total em vez de quantidade
    let dataValues, labelText;
    if (filterType === 'valor') {
        const valores = {
            acima10: products.filter(p => p.quantidade > 10).reduce((sum, p) => sum + (p.quantidade * (p.preco || 0)), 0),
            entre5_10: products.filter(p => p.quantidade >= 5 && p.quantidade <= 10).reduce((sum, p) => sum + (p.quantidade * (p.preco || 0)), 0),
            entre1_5: products.filter(p => p.quantidade >= 1 && p.quantidade < 5).reduce((sum, p) => sum + (p.quantidade * (p.preco || 0)), 0),
            zerados: products.filter(p => p.quantidade === 0).reduce((sum, p) => sum + (p.quantidade * (p.preco || 0)), 0)
        };
        dataValues = Object.values(valores);
        labelText = 'Valor Total (R$)';
    } else {
        dataValues = Object.values(categories);
        labelText = 'Quantidade de Produtos';
    }
    
    ctx.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Acima de 10', 'Entre 5-10', 'Entre 1-5', 'Zerados'],
            datasets: [{
                label: labelText,
                data: dataValues,
                backgroundColor: [
                    '#10b981', // verde
                    '#3b82f6', // azul
                    '#f59e0b', // amarelo
                    '#ef4444'  // vermelho
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTop10Chart(products) {
    const ctx = document.getElementById('chartTop10');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    // Ordenar produtos por valor total (quantidade * preço)
    const sortedProducts = [...products]
        .sort((a, b) => (b.quantidade * (b.preco || 0)) - (a.quantidade * (a.preco || 0)))
        .slice(0, 10);
    
    const labels = sortedProducts.map(p => p.referencia?.substring(0, 15) || `Produto ${sortedProducts.indexOf(p) + 1}`);
    const values = sortedProducts.map(p => p.quantidade * (p.preco || 0));
    
    ctx.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor Total (R$)',
                data: values,
                backgroundColor: '#3b82f6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateRecentProducts() {
    const tbody = document.getElementById('recentProducts');
    if (!tbody) return;
    
    const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
    const recentProducts = [...data.produtos]
        .sort((a, b) => new Date(b.dataAtualizacao || 0) - new Date(a.dataAtualizacao || 0))
        .slice(0, 5);
    
    tbody.innerHTML = '';
    
    if (recentProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Nenhum produto cadastrado ainda.
                    <a href="importar.html">Importe dados</a> para começar.
                </td>
            </tr>
        `;
        return;
    }
    
    recentProducts.forEach(product => {
        const row = document.createElement('tr');
        const valorTotal = (product.quantidade * (product.preco || 0)).toFixed(2);
        
        // Determinar categoria
        let categoria = 'Acima de 10';
        if (product.quantidade === 0) categoria = 'Zerados';
        else if (product.quantidade <= 5) categoria = 'Entre 1-5';
        else if (product.quantidade <= 10) categoria = 'Entre 5-10';
        
        row.innerHTML = `
            <td>${product.referencia || 'N/A'}</td>
            <td><span class="badge">${categoria}</span></td>
            <td>${product.quantidade || 0}</td>
            <td>R$ ${(product.preco || 0).toFixed(2)}</td>
            <td>${product.dataAtualizacao ? new Date(product.dataAtualizacao).toLocaleDateString('pt-BR') : '--'}</td>
            <td>
                <button class="btn-icon btn-sm" onclick="window.location.href='produtos.html'">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePriorityAlerts() {
    const container = document.getElementById('priorityAlerts');
    if (!container) return;
    
    const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
    const criticalProducts = data.produtos.filter(p => p.quantidade <= 1);
    
    // Atualizar contador
    document.getElementById('alertCount').textContent = criticalProducts.length;
    
    if (criticalProducts.length === 0) {
        container.innerHTML = `
            <div class="alert-item success">
                <i class="fas fa-check-circle"></i>
                <div class="alert-content">
                    <strong>Tudo sob controle!</strong>
                    <p>Nenhum alerta crítico no momento.</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    criticalProducts.slice(0, 3).forEach(product => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item danger';
        alertItem.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div class="alert-content">
                <strong>Estoque crítico: ${product.referencia || 'Produto'}</strong>
                <p>Quantidade: ${product.quantidade} - ${product.descricao?.substring(0, 30) || ''}</p>
            </div>
            <button class="btn-icon" onclick="window.location.href='alertas.html'">
                <i class="fas fa-arrow-right"></i>
            </button>
        `;
        container.appendChild(alertItem);
    });
    
    if (criticalProducts.length > 3) {
        const moreItem = document.createElement('div');
        moreItem.className = 'alert-item info';
        moreItem.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <div class="alert-content">
                <strong>+${criticalProducts.length - 3} alertas</strong>
                <p>Clique para ver todos os alertas.</p>
            </div>
            <button class="btn-icon" onclick="window.location.href='alertas.html'">
                <i class="fas fa-arrow-right"></i>
            </button>
        `;
        container.appendChild(moreItem);
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateStr = now.toLocaleDateString('pt-BR', options);
    document.getElementById('currentDate').textContent = dateStr;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function showChartErrorMessages() {
    // Mostrar mensagens amigáveis onde os gráficos deveriam estar
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div class="chart-error">
                <i class="fas fa-chart-line"></i>
                <p>Gráfico não disponível</p>
                <small>Chart.js não carregou corretamente</small>
            </div>
        `;
    });
    
    // Adicionar CSS para a mensagem de erro
    const style = document.createElement('style');
    style.textContent = `
        .chart-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #666;
            text-align: center;
            padding: 2rem;
        }
        .chart-error i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #ccc;
        }
        .chart-error p {
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .chart-error small {
            font-size: 0.8rem;
        }
    `;
    document.head.appendChild(style);
}

// Funções globais
function exportDashboard() {
    alert('Exportar dashboard - Funcionalidade em desenvolvimento');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('tuboluc_theme', newTheme);
}