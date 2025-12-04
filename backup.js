// backup.js
// Integrações de backup com app.js (dataManager.backupData e dataManager.restoreData)

document.addEventListener('DOMContentLoaded', () => {
  initBackupPage();
});

const backupState = {
  backups: [], // {id, name, createdAt, size, status}
  selectedIds: new Set()
};

function initBackupPage() {
  // Carregar lista do localStorage, se quiser evoluir depois
  loadBackupListFromStorage();
  renderBackupTable();
  updateBackupFooter();
}

/* Persistência simples da lista de backups */

function saveBackupListToStorage() {
  try {
    localStorage.setItem('tuboluc_backups', JSON.stringify(backupState.backups));
  } catch (e) {
    alert('Não foi possível salvar a lista de backups no navegador.');
  }
}

function loadBackupListFromStorage() {
  try {
    const saved = localStorage.getItem('tuboluc_backups');
    if (!saved) return;
    backupState.backups = JSON.parse(saved);
  } catch (e) {
    backupState.backups = [];
  }
}

/* Renderização */

function renderBackupTable() {
  const tbody = document.getElementById('backupTableBody');
  if (!tbody) return;

  let html = '';

  backupState.backups.forEach(bkp => {
    const checked = backupState.selectedIds.has(bkp.id) ? 'checked' : '';
    html += `
      <tr data-id="${bkp.id}">
        <td>
          <input type="checkbox"
                 class="backup-checkbox"
                 aria-label="Selecionar backup ${bkp.name}"
                 onchange="toggleBackupSelection('${bkp.id}')"
                 ${checked}>
        </td>
        <td>${bkp.name}</td>
        <td>${bkp.createdAt}</td>
        <td>${bkp.size || '—'}</td>
        <td><span class="badge ${bkp.status === 'Completo' ? 'badge-success' : 'badge-warning'}">
          ${bkp.status}
        </span></td>
        <td>
          <button class="btn-icon"
                  onclick="restoreBackupById('${bkp.id}')"
                  aria-label="Restaurar o backup ${bkp.name}">
            <i class="fas fa-undo" aria-hidden="true"></i>
          </button>
          <button class="btn-icon"
                  onclick="downloadBackup('${bkp.id}')"
                  aria-label="Baixar o backup ${bkp.name}">
            <i class="fas fa-download" aria-hidden="true"></i>
          </button>
          <button class="btn-icon"
                  onclick="deleteBackupById('${bkp.id}')"
                  aria-label="Excluir o backup ${bkp.name}">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  syncSelectAllBackups();
  updateBackupFooter();
}

/* Seleção */

function toggleBackupSelection(id) {
  if (backupState.selectedIds.has(id)) {
    backupState.selectedIds.delete(id);
  } else {
    backupState.selectedIds.add(id);
  }
  syncSelectAllBackups();
}

function toggleSelectAllBackups() {
  const selectAll = document.getElementById('selectAllBackups');
  if (!selectAll) return;

  backupState.selectedIds.clear();

  if (selectAll.checked) {
    backupState.backups.forEach(b => backupState.selectedIds.add(b.id));
  }

  renderBackupTable();
}

function syncSelectAllBackups() {
  const selectAll = document.getElementById('selectAllBackups');
  if (!selectAll) return;

  const total = backupState.backups.length;
  const selected = backupState.selectedIds.size;

  selectAll.checked = total > 0 && selected === total;
  selectAll.indeterminate = selected > 0 && selected < total;
}

/* Ações principais, chamados pelos botões da página */

function createBackup() {
  // Usa a função de backup que já existe no app.js
  if (typeof dataManager === 'undefined' || !dataManager.backupData) {
    alert('Função de backup ainda não disponível (ver app.js).');
    return;
  }

  // Cria o arquivo de backup (download JSON)
  dataManager.backupData();

  const now = new Date();
  const id = 'bkp_' + now.getTime();
  const createdAt = now.toLocaleString('pt-BR');

  backupState.backups.unshift({
    id,
    name: `Backup manual ${createdAt}`,
    createdAt,
    size: '',      // você pode medir depois
    status: 'Completo'
  });

  saveBackupListToStorage();
  renderBackupTable();
}

function restoreBackup() {
  if (backupState.selectedIds.size === 0) {
    alert('Selecione um backup para restaurar.');
    return;
  }
  const id = Array.from(backupState.selectedIds)[0];
  restoreBackupById(id);
}

/* Restauração com seletor de arquivo (arquivo JSON gerado pelo app.js) */

function restoreBackupById(id) {
  if (typeof dataManager === 'undefined' || !dataManager.restoreData) {
    alert('Função de restauração ainda não disponível (ver app.js).');
    return;
  }

  // Abre seletor de arquivo; o usuário escolhe o JSON correspondente
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';

  input.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await dataManager.restoreData(file);
      alert('Backup restaurado com sucesso.');
    } catch (err) {
      alert('Erro ao restaurar backup: ' + err.message);
    }
  };

  input.click();
}

/* Download e exclusão (só afetam a lista local) */

function downloadBackup(id) {
  alert('O arquivo de backup é gerado no momento da criação. Guarde o JSON baixado para uso real.');
}

function deleteBackup() {
  if (backupState.selectedIds.size === 0) {
    alert('Selecione pelo menos um backup para excluir.');
    return;
  }
  if (!confirm('Tem certeza que deseja excluir os backups selecionados da lista?')) return;

  backupState.backups = backupState.backups.filter(
    b => !backupState.selectedIds.has(b.id)
  );
  backupState.selectedIds.clear();
  saveBackupListToStorage();
  renderBackupTable();
}

function deleteBackupById(id) {
  if (!confirm('Excluir este backup da lista?')) return;

  backupState.backups = backupState.backups.filter(b => b.id !== id);
  backupState.selectedIds.delete(id);
  saveBackupListToStorage();
  renderBackupTable();
}

/* Rodapé */

function updateBackupFooter() {
  const total = backupState.backups.length;
  const showing = Math.min(total, backupState.backups.length);

  const showingEl = document.getElementById('showingBackups');
  const totalEl = document.getElementById('totalBackups');
  const pageInfo = document.getElementById('backupPageInfo');

  if (showingEl) showingEl.textContent = showing;
  if (totalEl) totalEl.textContent = total;
  if (pageInfo) pageInfo.textContent = 'Página 1 de 1';
}
