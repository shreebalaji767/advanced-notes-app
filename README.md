# Advanced Notes

A free, static, offline-capable notes workspace built with vanilla HTML, CSS and JavaScript.

## Features
- Rich-text editing and Markdown editing/preview
- Notes, folders, tags, favorites, archive and recycle bin
- Search, sorting, word and character counts
- Autosave to IndexedDB
- Optional AES-256-GCM encryption with PBKDF2 password derivation
- Backup and restore
- Markdown and HTML export
- Note version history
- PWA installability and offline app shell
- Responsive desktop, tablet and mobile layout

## Deployment
GitHub Actions publishes the app from the advanced-notes-app.zip archive whenever changes are pushed to main. The archive is unpacked into the Pages artifact automatically.

After the first workflow run, check Settings > Pages and confirm the source is GitHub Actions if GitHub has not selected it automatically.

## Run locally
Serve the extracted folder over localhost (required for Web Crypto and service workers) with: python -m http.server 8000
Then open http://localhost:8000.

## Privacy and security
Notes are stored locally in this browser using IndexedDB. Optional encryption uses AES-256-GCM and PBKDF2. The password cannot be recovered; if it is forgotten, encrypted notes cannot be decrypted. Export a backup and keep the password safe.

## Limitations
This is a local single-device app. It does not sync across devices or provide collaboration. Browser storage is not a substitute for an independent backup. Offline support requires HTTPS or localhost.
