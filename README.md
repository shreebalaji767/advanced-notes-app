# Advanced Notes

A free, static, offline-capable notes workspace built with vanilla HTML, CSS and JavaScript.

## Features
- Classic three-pane desktop workspace with responsive tablet and mobile layouts
- Rich-text editor with headings, inline code blocks, checklists, tables, links and formatting tools
- Dedicated local code snippet library for JavaScript, Python, HTML, CSS, SQL and many more languages; save, search, copy, download, tag, import and export snippets
- Markdown editing and preview
- Daily journal templates, due dates, pinned notes and dark mode
- Standalone task manager with completion tracking and due dates
- Monthly calendar for due notes and daily journal entries
- Duplicate notes and print-friendly output (including browser print-to-PDF)
- Notes, nested folders, tags, favorites, pinned notes, archive and restorable recycle bin
- Smart views for pinned notes and notes due within the next seven days
- Basic HTML sanitization for imported and rendered note content
- Search, sorting, word and character counts
- Autosave to browser local storage; code snippets are stored in the same local vault and included in encrypted backups
- Optional AES-256-GCM encryption with PBKDF2 password derivation
- Backup and restore with validation for encrypted and unencrypted backups
- Weekly backup reminder, Markdown export and standalone HTML export
- Version-history browser with side-by-side text comparison, restore and export
- Reusable meeting, project, study, journal and decision templates
- Related-note links with automatically generated backlinks
- Distraction-free focus mode with keyboard shortcut (Ctrl/Cmd+Alt+F)
- Installable PWA with scalable 192px and 512px SVG icons and an offline app shell
- Automated Chromium desktop and mobile regression tests in GitHub Actions; deployment waits for tests to pass
- Keyboard shortcuts: Ctrl/Cmd+S to save, Ctrl/Cmd+K to search, Ctrl/Cmd+Shift+N for a daily note

## Deploy
GitHub Actions publishes the root static files from the main branch. After the first workflow run, check Settings > Pages and ensure the source is GitHub Actions if it is not selected automatically.

## Run locally
Serve this folder over localhost (needed for Web Crypto and service workers), for example with Python: `python -m http.server 8000`. Then open http://localhost:8000.

## Privacy and security
Notes and tasks are stored locally in this browser. Optional encryption uses AES-256-GCM and PBKDF2. The password cannot be recovered; if forgotten, encrypted notes cannot be decrypted. Export a backup and keep the password safe. The HTML sanitizer is a defense-in-depth measure, not a formal security audit.

## Limitations
This is a local single-device app. It does not sync across devices or provide collaboration. Browser storage is not a substitute for an independent backup. Offline support requires HTTPS or localhost. The calendar currently visualizes due dates and journal entries; it is not a full scheduling system. The task manager is separate from inline note checklists.


## Automated browser tests

The GitHub Actions workflow installs Playwright and Chromium, then runs the regression suite in `tests/` before publishing. To run it locally:

```sh
npm install --no-save @playwright/test
npx playwright install chromium
npx playwright test
```

The suite checks workspace loading, local note persistence, task creation, calendar navigation, PWA icon assets and mobile control visibility. Browser tests use a temporary local HTTP server and do not access or modify a user's existing browser storage.
