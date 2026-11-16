# Advanced Notes

A free, static, offline-capable notes workspace built with vanilla HTML, CSS and JavaScript.

## Features
- Rich-text editor with headings, code blocks, checklists and tables
- Markdown editing/preview
- Daily journal templates, due dates, pinned notes and dark mode
- Duplicate notes and print-friendly output
- Notes, folders, tags, favorites, archive and recycle bin
- Search, sorting, word and character counts
- Autosave to browser local storage
- Optional AES-256-GCM encryption with PBKDF2 password derivation
- Backup and restore, Markdown export and note version history
- Installable PWA with an offline app shell
- Responsive desktop, tablet and mobile layout

## Deploy
GitHub Actions publishes the root static files from the main branch. After the first workflow run, check Settings > Pages and ensure the source is GitHub Actions if it is not selected automatically.

## Run locally
Serve this folder over localhost (needed for Web Crypto and service workers), for example with Python: python -m http.server 8000. Then open http://localhost:8000.

## Privacy and security
Notes are stored locally in this browser. Optional encryption uses AES-256-GCM and PBKDF2. The password cannot be recovered; if forgotten, encrypted notes cannot be decrypted. Export a backup and keep the password safe.

## Limitations
This is a local single-device app. It does not sync across devices or provide collaboration. Browser storage is not a substitute for an independent backup. Offline support requires HTTPS or localhost.
