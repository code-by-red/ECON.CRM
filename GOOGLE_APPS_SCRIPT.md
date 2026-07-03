# Google Apps Script - Backend do CRM.ECON

Este arquivo contém o código para configurar o backend no Google Apps Script.

## 📝 Código do Apps Script

Copie este código para o seu projeto no Google Apps Script:

```javascript
// Configuração da planilha
const SPREADSHEET_ID = 'SEU_SPREADSHEET_ID_AQUI';
const SHEET_NAME = 'Leads';

// doGet - Para requisições GET
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getLeads') {
    return getLeads();
  }
  
  return createResponse({ error: 'Ação não reconhecida' });
}

// doOptions - Para requisições OPTIONS (CORS preflight)
function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

// doPost - Para requisições POST
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'saveLead') {
      return saveLead(data.data);
    }
    
    return createResponse({ error: 'Ação não reconhecida' });
  } catch (error) {
    return createResponse({ error: error.toString() });
  }
}

// Buscar todos os leads
function getLeads() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const leads = rows.map(row => {
    const lead = {};
    headers.forEach((header, index) => {
      lead[header] = row[index];
    });
    return lead;
  });
  
  return createResponse(leads);
}

// Salvar novo lead
function saveLead(leadData) {
  const sheet = getSheet();
  
  // Adicionar timestamp
  const timestamp = new Date().toISOString();
  
  // Mapear campos para a planilha
  const row = [
    timestamp,
    leadData.name,
    leadData.phone,
    leadData.contactMethod,
    leadData.stage,
    leadData.value || 0
  ];
  
  sheet.appendRow(row);
  
  return createResponse({ success: true, message: 'Lead salvo com sucesso' });
}

// Obter ou criar planilha
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Criar cabeçalhos
    sheet.appendRow(['Timestamp', 'Nome', 'Telefone', 'Meio de Contato', 'Etapa', 'Valor']);
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

// Criar resposta JSON com CORS
function createResponse(data) {
  const response = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Adicionar headers CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}
```

## 🔧 Como Configurar

### 1. Criar Planilha Google Sheets

1. Acesse: https://sheets.google.com
2. Clique em **"Em branco"** para criar uma nova planilha
3. Nomeie a planilha como **"CRM.ECON Database"**
4. **IMPORTANTE**: Copie o ID da URL da planilha
   - A URL será algo como: `https://docs.google.com/spreadsheets/d/1BxiM.../edit`
   - O ID é a parte entre `/d/` e `/edit`: `1BxiM...`
5. Crie a aba "Leads" com os cabeçalhos:
   - Clique na célula A1 e digite: `Timestamp`
   - B1: `Nome`
   - C1: `Telefone`
   - D1: `Meio de Contato`
   - E1: `Etapa`
   - F1: `Valor`
6. Selecione a linha 1 (cabeçalhos) e clique em **View** > **Freeze** > **1 row**

### 2. Criar Projeto no Apps Script

1. Acesse: https://script.google.com/
2. Clique em **"Novo projeto"**
3. Apague o código padrão que aparece
4. Cole o código do Apps Script fornecido acima (incluindo a função `doOptions` para CORS)
5. **CRUCIAL**: Substitua `SEU_SPREADSHEET_ID_AQUI` pelo ID da sua planilha copiado no passo 1
6. Salve o projeto (Ctrl+S ou clique no ícone de disquete)
7. Dê um nome ao projeto: **"CRM.ECON API"**

### 3. Publicar como Web App

1. Clique no botão **"Implantar"** (canto superior direito)
2. Selecione **"Novo implantação"**
3. No tipo de implantação, selecione **"Aplicativo web"**
4. Configure as seguintes opções:
   - **Descrição**: `CRM.ECON API v1`
   - **Executar como**: `Eu` (seu email do Google)
   - **Quem tem acesso**: `Qualquer pessoa` (importante para o frontend funcionar)
5. Clique em **"Implantar"**
6. O Google pedirá permissão - clique em **"Revisar permissões"**
7. Selecione sua conta do Google
8. Clique em **"Avançado"** > **"Acessar CRM.ECON API (não seguro)"**
9. Clique em **"Permitir"**
10. Copie a **URL do aplicativo web** que aparece após o deployment
    - Será algo como: `https://script.google.com/macros/s/AKfycb.../exec`

### 4. Configurar Variável de Ambiente Local

1. No seu projeto CRM.ECON, copie o arquivo `config.example.js` para `config.js`:
   ```bash
   cp config.example.js config.js
   ```

2. Abra o arquivo `config.js` e cole a URL do Apps Script:
   ```javascript
   window.ENV = {
     GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/SUA_URL_AQUI/exec'
   };
   ```

3. Substitua `SUA_URL_AQUI` pela URL copiada no passo 3

### 5. Configurar Variável de Ambiente na Vercel (Produção)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **CRM.ECON**
3. Vá em **Settings** > **Environment Variables**
4. Clique em **"Add New"**
5. Configure:
   - **Name**: `GOOGLE_APPS_SCRIPT_URL`
   - **Value**: Cole a URL do Apps Script copiada no passo 3
   - **Environment**: Marque **Production**, **Preview** e **Development**
6. Clique em **"Save"**
7. Vá em **Deployments**, clique nos três pontos do deployment mais recente e selecione **"Redeploy"**

## 🔒 Permissões do Google

Na primeira execução, o Google pedirá permissão para:
- **Ver, editar, criar e excluir suas planilhas do Google Sheets**
- **Executar o script como você**

Isso é normal e necessário para que o Apps Script possa acessar sua planilha.

## 📊 Estrutura da Planilha

A planilha terá automaticamente as seguintes colunas:

| Timestamp | Nome | Telefone | Meio de Contato | Etapa | Valor |
|-----------|------|----------|-----------------|-------|-------|
| 2024-01-01T10:00:00Z | João Silva | 11999999999 | whatsapp | prospecto | 0 |
| 2024-01-01T11:00:00Z | Maria Santos | 11988888888 | ligacao | atendimento | 0 |
| 2024-01-01T12:00:00Z | Pedro Oliveira | 11977777777 | indicacao | visita | 500000 |
| 2024-01-01T13:00:00Z | Ana Costa | 11966666666 | whatsapp | venda | 450000 |

## ✅ Verificação

Após configurar tudo:

1. Abra o CRM.ECON no navegador
2. Preencha o formulário com um lead de teste
3. Clique em **"Salvar Cadastro"**
4. Verifique se aparece a notificação de sucesso
5. Abra sua planilha Google Sheets
6. Verifique se o lead foi adicionado na aba "Leads"

Se funcionar, a integração está completa!
