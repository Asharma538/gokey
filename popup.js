// Default keyword mappings (kept in sync with background.js)
const defaultMappings = {
  "ash": "https://asharma.tech",
  "mt": "https://meet.google.com",
  "ml": "https://mail.google.com",
  "gh": "https://github.com",
  "yt": "https://youtube.com",
  "nt": "https://netflix.com",
  "am": "https://amazon.in",
  "gg": "https://google.com",
  "ch": "https://chatgpt.com",
  "cl": "https://cloudflare.com",
  "dr": "https://drive.google.com",
  "li": "https://linkedin.com/feed/"
};

// ---------- Toast ----------
let toastTimer = null;
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// ---------- Load / render ----------
function loadMappings() {
  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || defaultMappings;
    displayMappings(mappings);
  });
}

function displayMappings(mappings) {
  const container = document.getElementById('mappings');
  const entries = Object.entries(mappings);
  container.innerHTML = '';

  document.getElementById('mappingCount').textContent =
    entries.length ? `${entries.length} mapping${entries.length === 1 ? '' : 's'}` : '';

  if (entries.length === 0) {
    container.innerHTML = `<div class="empty-state">No mappings yet — add one below</div>`;
    return;
  }

  for (const [keyword, url] of entries) {
    const item = document.createElement('div');
    item.className = 'mapping-item';
    item.innerHTML = `
      <span class="keyword" data-keyword="${keyword}">${keyword}</span>
      <input type="text" class="url" value="${url}" data-keyword="${keyword}" spellcheck="false">
      <div class="row-actions">
        <button class="icon-btn edit-btn" data-keyword="${keyword}" title="Edit URL">
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="icon-btn delete-btn" data-keyword="${keyword}" title="Delete">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    `;
    container.appendChild(item);
  }

  document.querySelectorAll('.mapping-item .delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      deleteMapping(e.currentTarget.dataset.keyword);
    });
  });

  document.querySelectorAll('.mapping-item .edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const keyword = e.currentTarget.dataset.keyword;
      const urlInput = document.querySelector(`.mapping-item input.url[data-keyword="${keyword}"]`);
      urlInput.focus();
      urlInput.select();
    });
  });

  document.querySelectorAll('.mapping-item input.url').forEach(input => {
    input.addEventListener('blur', (e) => {
      const keyword = e.target.dataset.keyword;
      const newUrl = e.target.value.trim();
      if (newUrl) {
        updateMapping(keyword, newUrl);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.target.blur();
      }
    });
  });
}

// ---------- Mutations ----------
function addMapping(keyword, url) {
  if (!keyword || !url) {
    showToast('Enter both a keyword and a URL', true);
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || { ...defaultMappings };
    mappings[keyword.toLowerCase()] = url;
    chrome.storage.local.set({ keywordMappings: mappings }, () => {
      loadMappings();
      document.getElementById('newKeyword').value = '';
      document.getElementById('newUrl').value = '';
      document.getElementById('newKeyword').focus();
      showToast(`Added "${keyword.toLowerCase()}"`);
    });
  });
}

function deleteMapping(keyword) {
  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || { ...defaultMappings };
    delete mappings[keyword];
    chrome.storage.local.set({ keywordMappings: mappings }, () => {
      loadMappings();
      showToast(`Removed "${keyword}"`);
    });
  });
}

function updateMapping(keyword, newUrl) {
  if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
    newUrl = 'https://' + newUrl;
  }

  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || { ...defaultMappings };
    mappings[keyword.toLowerCase()] = newUrl;
    chrome.storage.local.set({ keywordMappings: mappings }, () => {
      const urlInput = document.querySelector(`.mapping-item input.url[data-keyword="${keyword}"]`);
      if (urlInput) {
        urlInput.value = newUrl;
      }
      showToast('Saved');
    });
  });
}

// ---------- Export / Import ----------
function exportConfig() {
  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || defaultMappings;
    const configString = JSON.stringify(mappings, null, 2);

    document.getElementById('exportTextarea').value = configString;
    document.getElementById('exportModal').classList.add('active');
  });
}

function importConfig() {
  const configString = document.getElementById('importTextarea').value.trim();

  if (!configString) {
    showToast('Paste a config string first', true);
    return;
  }

  try {
    const mappings = JSON.parse(configString);

    if (typeof mappings !== 'object' || mappings === null || Array.isArray(mappings)) {
      throw new Error('Invalid config format');
    }

    for (const [key, value] of Object.entries(mappings)) {
      if (typeof value !== 'string') {
        throw new Error('Invalid config: all values must be strings');
      }
    }

    chrome.storage.local.set({ keywordMappings: mappings }, () => {
      loadMappings();
      closeModal('importModal');
      document.getElementById('importTextarea').value = '';
      showToast('Configuration imported');
    });
  } catch (e) {
    showToast('Invalid config string', true);
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// ---------- Event wiring ----------
document.addEventListener('DOMContentLoaded', loadMappings);

document.getElementById('addBtn').addEventListener('click', () => {
  const keyword = document.getElementById('newKeyword').value.trim();
  const url = document.getElementById('newUrl').value.trim();
  addMapping(keyword, url);
});

document.getElementById('newUrl').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const keyword = document.getElementById('newKeyword').value.trim();
    const url = document.getElementById('newUrl').value.trim();
    addMapping(keyword, url);
  }
});

document.getElementById('newKeyword').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('newUrl').focus();
  }
});

document.getElementById('exportBtn').addEventListener('click', exportConfig);
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importModal').classList.add('active');
});

document.getElementById('closeExportModal').addEventListener('click', () => closeModal('exportModal'));
document.getElementById('closeImportModal').addEventListener('click', () => closeModal('importModal'));

document.getElementById('copyBtn').addEventListener('click', () => {
  const textarea = document.getElementById('exportTextarea');
  textarea.select();
  document.execCommand('copy');
  showToast('Copied to clipboard');
});

document.getElementById('confirmImport').addEventListener('click', importConfig);

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
});