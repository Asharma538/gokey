# GoKey: Keyword URL Mapper Chrome Extension

A Chrome extension that allows you to map short keywords to URLs for quick navigation.

## Default Mappings

| Keyword | URL |
|---------|-----|
| `ash` | https://asharma.tech |
| `mt` | https://meet.google.com |
| `ml` | https://mail.google.com |
| `gh` | https://github.com |
| `yt` | https://youtube.com |
| `nt` | https://netflix.com |
| `am` | https://amazon.in |
| `gg` | https://google.com |
| `ch` | https://chatgpt.com |
| `cl` | https://cloudflare.com |
| `dr` | https://drive.google.com |
| `li` | https://linkedin.com/feed/ |

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `chrome-ext` folder containing these files

## Usage

### Method 1: Omnibox (Recommended)
1. Type `go` in the address bar and press Space or Tab
2. Type your keyword (e.g., `ash`, `mt`, `ml`, `gh`)
3. Press Enter to navigate to the mapped URL

### Method 2: Google Search
1. Type your keyword directly in the address bar
2. If it matches a mapping, you'll be redirected automatically

## Managing Mappings

1. Click the extension icon in your browser toolbar
2. View existing mappings in the popup
3. Add new mappings using the form at the bottom
4. Delete mappings by clicking the "Delete" button

## Adding Custom Mappings

You can add your own keyword-URL pairs:
- Click the extension icon
- Enter a keyword (e.g., `tw` for Twitter)
- Enter the URL (e.g., `https://twitter.com`)
- Click "Add"

## Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker that handles navigation
- `popup.html` - UI for managing mappings
- `popup.js` - Popup logic
- `icon.svg` - Extension icon
