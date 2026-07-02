// Default keyword mappings
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

// Initialize mappings from storage or use defaults
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['keywordMappings'], (result) => {
    if (!result.keywordMappings) {
      chrome.storage.local.set({ keywordMappings: defaultMappings });
    }
  });
});

// Listen for omnibox input (if user types the extension keyword)
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const keyword = text.trim().toLowerCase();
  chrome.storage.local.get(['keywordMappings'], (result) => {
    const mappings = result.keywordMappings || defaultMappings;
    const url = mappings[keyword];
    
    if (url) {
      if (disposition === "currentTab") {
        chrome.tabs.update({ url: url });
      } else if (disposition === "newForegroundTab") {
        chrome.tabs.create({ url: url });
      } else if (disposition === "newBackgroundTab") {
        chrome.tabs.create({ url: url, active: false });
      }
    } else {
      // If no mapping found, search normally
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
      chrome.tabs.update({ url: searchUrl });
    }
  });
});
