// configuracoes.js
// Gerenciamento das configurações do sistema (salvas em localStorage)

document.addEventListener('DOMContentLoaded', () => {
  loadSettingsFromStorage();
  setupConfigListeners();
});

// Chave única para este módulo
const SETTINGS_KEY = 'tuboluc_settings_v1';

function getSettingsFromForm() {
  return {
    appName: document.getElementById('appName')?.value || '',
    themeMode: document.getElementById('themeMode')?.value || 'light',
    animationsEnabled: !!document.getElementById('animationsEnabled')?.checked,
    notificationsEnabled: !!document.getElementById('notificationsEnabled')?.checked,
    stockThreshold: parseInt(document.getElementById('stockThreshold')?.value || '0', 10),
    emailAlerts: document.getElementById('emailAlerts')?.value || '',
    emailCritical: !!document.getElementById('emailCritical')?.checked,
    emailHigh: !!document.getElementById('emailHigh')?.checked,
    supabaseEnabled: !!document.getElementById('supabaseEnabled')?.checked,
    googleDriveEnabled: !!document.getElementById('googleDriveEnabled')?.checked,
    autoBackup: !!document.getElementById('autoBackup')?.checked,
    logLevel: document.getElementById('logLevel')?.value || 'warn'
  };
}

function applySettingsToForm(settings) {
  if (!settings) return;

  const {
    appName,
    themeMode,
    animationsEnabled,
    notificationsEnabled,
    stockThreshold,
    emailAlerts,
    emailCritical,
    emailHigh,
    supabaseEnabled,
    googleDriveEnabled,
    autoBackup,
    logLevel
  } = settings;

  const appNameEl = document.getElementById('appName');
  if (appNameEl) appNameEl.value = appName || '';

  const themeModeEl = document.getElementById('themeMode');
  if (themeModeEl) themeModeEl.value = themeMode || 'light';

  const animEl = document.getElementById('animationsEnabled');
  if (animEl) animEl.checked = !!animationsEnabled;

  const notifEl = document.getElementById('notificationsEnabled');
  if (notifEl) notifEl.checked = !!notificationsEnabled;

  const stockEl = document.getElementById('stockThreshold');
  if (stockEl) stockEl.value = stockThreshold != null ? stockThreshold : 5;

  const emailEl = document.getElementById('emailAlerts');
  if (emailEl) emailEl.value = emailAlerts || '';

  const critEl = document.getElementById('emailCritical');
  if (critEl) critEl.checked = !!emailCritical;

  const highEl = document.getElementById('emailHigh');
  if (highEl) highEl.checked = !!emailHigh;

  const supaEl = document.getElementById('supabaseEnabled');
  if (supaEl) supaEl.checked = !!supabaseEnabled;

  const gdriveEl = document.getElementById('googleDriveEnabled');
  if (gdriveEl) gdriveEl.checked = !!googleDriveEnabled;

  const autoBkpEl = document.getElementById('autoBackup');
  if (autoBkpEl) autoBkpEl.checked = !!autoBackup;

  const logLevelEl = document.getElementById('logLevel');
  if (logLevelEl) logLevelEl.value = logLevel || 'warn';
}

function saveSettingsToStorage() {
  const settings = getSettingsFromForm();
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Se existir themeManager em app.js, aplica o tema imediatamente
    if (typeof themeManager !== 'undefined' && themeManager.setTheme) {
      themeManager.setTheme(settings.themeMode);
    } else {
      // fallback simples
      document.documentElement.setAttribute('data-theme', settings.themeMode);
    }
    alert('Configurações salvas com sucesso.');
  } catch (e) {
    console.error('Erro ao salvar configurações:', e);
    alert('Não foi possível salvar as configurações.');
  }
}

function loadSettingsFromStorage() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return;
    const settings = JSON.parse(saved);
    applySettingsToForm(settings);

    // aplicar tema salvo
    if (settings.themeMode) {
      if (typeof themeManager !== 'undefined' && themeManager.setTheme) {
        themeManager.setTheme(settings.themeMode);
      } else {
        document.documentElement.setAttribute('data-theme', settings.themeMode);
      }
    }
  } catch (e) {
    console.error('Erro ao carregar configurações:', e);
  }
}

function resetAllSettings() {
  if (!confirm('Deseja realmente restaurar as configurações padrão?')) return;

  // valores padrão
  const defaults = {
    appName: 'Tuboluc Classificador Premium',
    themeMode: 'light',
    animationsEnabled: true,
    notificationsEnabled: true,
    stockThreshold: 5,
    emailAlerts: 'admin@tuboluc.com',
    emailCritical: true,
    emailHigh: false,
    supabaseEnabled: true,
    googleDriveEnabled: false,
    autoBackup: false,
    logLevel: 'warn'
  };

  applySettingsToForm(defaults);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults));
  } catch (e) {
    console.error('Erro ao salvar configurações padrão:', e);
  }

  if (typeof themeManager !== 'undefined' && themeManager.setTheme) {
    themeManager.setTheme(defaults.themeMode);
  } else {
    document.documentElement.setAttribute('data-theme', defaults.themeMode);
  }

  alert('Configurações restauradas para o padrão.');
}

function saveAllSettings() {
  saveSettingsToStorage();
}

function testConnections() {
  // Aqui você pode integrar com Supabase / APIs reais.
  alert('Teste de conexões executado (simulação).');
}

function addUser() {
  // Placeholder simples – depois você pode abrir um modal real.
  alert('Funcionalidade de adicionar usuário ainda não implementada.');
}

function editUser(id) {
  alert('Edição de usuário ainda não implementada. ID: ' + id);
}

function setupConfigListeners() {
  const themeModeEl = document.getElementById('themeMode');
  if (themeModeEl) {
    themeModeEl.addEventListener('change', () => {
      const mode = themeModeEl.value;
      if (typeof themeManager !== 'undefined' && themeManager.setTheme) {
        themeManager.setTheme(mode);
      } else {
        document.documentElement.setAttribute('data-theme', mode);
      }
    });
  }
}

/* Expor funções para uso no HTML (onclick) */
window.saveAllSettings = saveAllSettings;
window.resetAllSettings = resetAllSettings;
window.testConnections = testConnections;
window.addUser = addUser;
window.editUser = editUser;
