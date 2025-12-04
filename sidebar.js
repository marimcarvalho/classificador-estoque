// sidebar.js
document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // Salvar estado no localStorage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            
            // Ajustar conteúdo principal
            if (isCollapsed) {
                mainContent.style.marginLeft = '70px';
            } else {
                mainContent.style.marginLeft = '250px';
            }
        });
    }
    
    // Carregar estado do sidebar
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
        mainContent.style.marginLeft = '70px';
    }
    
    // Atualizar data e hora
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
    
    updateDateTime();
    setInterval(updateDateTime, 60000); // Atualizar a cada minuto
    
    // Logout function
    window.logout = function() {
        if (confirm('Deseja realmente sair do sistema?')) {
            localStorage.removeItem('tubolucData');
            window.location.href = 'login.html'; // Se tiver página de login
        }
    };
    
    // Atualizar contadores no menu
    function updateMenuCounters() {
        const data = JSON.parse(localStorage.getItem('tubolucData')) || { produtos: [] };
        
        // Contar produtos
        const prodCount = data.produtos.length;
        document.getElementById('prodCountMenu').textContent = prodCount;
        
        // Contar alertas (exemplo)
        const alertCount = data.produtos.filter(p => p.quantidade <= 5).length;
        document.getElementById('alertCountMenu').textContent = alertCount;
        
        // Atualizar título da página
        document.title = `(${prodCount}) Dashboard - Tuboluc`;
    }
    
    updateMenuCounters();
    
    // Menu mobile
    if (window.innerWidth <= 992) {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1001;
            background: var(--primary-color);
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        `;
        
        document.body.appendChild(mobileToggle);
        
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !mobileToggle.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
});