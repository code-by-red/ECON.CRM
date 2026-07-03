const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || '';

let html = fs.readFileSync(htmlPath, 'utf8');

// Substituir a linha que define a variável vazia
html = html.replace(
  'window.GOOGLE_APPS_SCRIPT_URL = window.GOOGLE_APPS_SCRIPT_URL || \'\';',
  `window.GOOGLE_APPS_SCRIPT_URL = '${appsScriptUrl}';`
);

fs.writeFileSync(htmlPath, html);
console.log('Variável de ambiente injetada no HTML');
