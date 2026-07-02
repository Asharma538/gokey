// Default mappings
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

// Load and display mappings
function loadMappings() {
  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || defaultMappings;
    displayMappings(mappings);
  });
}

// Display mappings in the popup
function displayMappings(mappings) {
  const container = document.getElementById('mappings');
  container.innerHTML = '';
  
  for (const [keyword, url] of Object.entries(mappings)) {
    const item = document.createElement('div');
    item.className = 'mapping-item';
    item.innerHTML = `
      <input type="text" class="keyword" value="${keyword}" readonly data-keyword="${keyword}">
      <input type="text" class="url" value="${url}" data-keyword="${keyword}">
      <button class="icon-btn edit-btn" data-keyword="${keyword}" title="Edit URL">
        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      </button>
      <button class="icon-btn delete-btn" data-keyword="${keyword}" title="Delete">
        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    `;
    container.appendChild(item);
  }
  
  // Add delete button listeners
  document.querySelectorAll('.mapping-item .delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const keywordToDelete = e.currentTarget.dataset.keyword;
      deleteMapping(keywordToDelete);
    });
  });
  
  // Add edit button listeners
  document.querySelectorAll('.mapping-item .edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const keywordToEdit = e.currentTarget.dataset.keyword;
      const urlInput = document.querySelector(`.mapping-item input.url[data-keyword="${keywordToEdit}"]`);
      urlInput.focus();
      urlInput.select();
    });
  });
  
  // Add URL input change listeners for editing
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

// Add a new mapping
function addMapping(keyword, url) {
  if (!keyword || !url) {
    alert('Please enter both keyword and URL');
    return;
  }
  
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || defaultMappings;
    mappings[keyword.toLowerCase()] = url;
    chrome.storage.local.set({ keywordMappings: mappings }, () => {
      loadMappings();
      document.getElementById('newKeyword').value = '';
      document.getElementById('newUrl').value = '';
    });
  });
}

// Delete a mapping
function deleteMapping(keyword) {
  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || defaultMappings;
    delete mappings[keyword];
    chrome.storage.local.set({ keywordMappings: mappings }, () => {
      loadMappings();
    });
  });
}

// Update an existing mapping
function updateMapping(keyword, newUrl) {
  // Ensure URL has protocol
  if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
    newUrl = 'https://' + newUrl;
  }
  
  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || defaultMappings;
    mappings[keyword.toLowerCase()] = newUrl;
    chrome.storage.local.set({ keywordMappings: mappings }, () => {
      // Don't reload, just update the input value with the formatted URL
      const urlInput = document.querySelector(`.mapping-item input.url[data-keyword="${keyword}"]`);
      if (urlInput) {
        urlInput.value = newUrl;
      }
    });
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadMappings);

document.getElementById('addBtn').addEventListener('click', () => {
  const keyword = document.getElementById('newKeyword').value.trim();
  const url = document.getElementById('newUrl').value.trim();
  addMapping(keyword, url);
});

// Allow adding with Enter key
document.getElementById('newUrl').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const keyword = document.getElementById('newKeyword').value.trim();
    const url = document.getElementById('newUrl').value.trim();
    addMapping(keyword, url);
  }
});
