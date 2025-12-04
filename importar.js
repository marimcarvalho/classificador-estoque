// importar.js
let importData = {
    files: [],
    mappings: [],
    currentStep: 1
};

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateStep(1);
});

function setupEventListeners() {
    // Drag and drop
    const dropZone = document.querySelector('.upload-card');
    if (dropZone) {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('drop', handleDrop);
    }
    
    // Busca
    const searchInput = document.getElementById('searchProducts');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchProducts, 300));
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#4cd964';
    e.currentTarget.style.backgroundColor = '#f0fff4';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    handleFiles(files);
    
    e.currentTarget.style.borderColor = '#667eea';
    e.currentTarget.style.backgroundColor = '#f8f9ff';
}

async function handleFiles(fileList) {
    const files = Array.from(fileList);
    
    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
            showToast('Arquivo muito grande: ' + file.name, 'error');
            continue;
        }
        
        if (!['.xlsx', '.xls', '.csv'].some(ext => file.name.toLowerCase().endsWith(ext))) {
            showToast('Formato não suportado: ' + file.name, 'error');
            continue;
        }
        
        // Adicionar à lista
        importData.files.push({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        });
    }
    
    updateFileList();
    document.getElementById('btnNextStep1').disabled = importData.files.length === 0;
}

function updateStep(step) {
    // Atualizar steps visuais
    document.querySelectorAll('.wizard-step').forEach((el, index) => {
        if (index + 1 <= step) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    // Mostrar conteúdo do passo atual
    document.querySelectorAll('.wizard-content').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(`step${step}`).classList.add('active');
    
    importData.currentStep = step;
}