README
======

This folder is where you should place company documentation files (e.g. .docx).

How to use:
1. Copy your .docx files into this folder, for example:
   - public/docs/your-doc-1.docx
   - public/docs/your-doc-2.docx
2. Start the dev server: `npm run dev` (or restart it if it's running).
3. Open the app and go to the "Dokumentáció" page in the header. You can download files or try "Megtekintés" which will attempt to embed the document via the Microsoft Office Online viewer.

Notes:
- The Office embed viewer requires the file to be accessible from the running server origin (e.g. http://localhost:3002/docs/your-doc-1.docx). If embedding fails, use the download link.
- If you want the docs to be public on the internet, deploy the site or host the files on a public URL and update links accordingly.
