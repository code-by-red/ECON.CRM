// Script para injetar variáveis de ambiente no HTML para Vercel
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

if (!appsScriptUrl) {
  console.warn('GOOGLE_APPS_SCRIPT_URL não encontrada. Usando placeholder.');
}

let html = fs.readFileSync(htmlPath, 'utf8');

// Injetar a variável antes do script config.js
const injectScript = `
<script>
  window.GOOGLE_APPS_SCRIPT_URL = '${appsScriptUrl || ''}';
</script>
`;

html = html.replace('<script src="config.js" onerror="this.remove()"></script>', injectScript + '<script src="config.js" onerror="this.remove()"></script>');

fs.writeFileSync(htmlPath, html);
console.log('Variável de ambiente injetada no HTML');
