// API Module - Gerenciamento exclusivo da integração com Google Apps Script
// A URL do Apps Script é carregada de variáveis de ambiente para segurança

const api = {
    // Obter URL do Apps Script de variáveis de ambiente
    getAppsScriptURL: function() {
        // Em desenvolvimento local, usa window.ENV (carregado do config.js)
        if (typeof window !== 'undefined' && window.ENV && window.ENV.GOOGLE_APPS_SCRIPT_URL) {
            return window.ENV.GOOGLE_APPS_SCRIPT_URL;
        }
        
        // Em produção (Vercel), usa variável injetada no HTML
        if (typeof window !== 'undefined' && window.GOOGLE_APPS_SCRIPT_URL) {
            return window.GOOGLE_APPS_SCRIPT_URL;
        }
        
        return null;
    },

    // Obter URL com proxy CORS para desenvolvimento local
    getProxyURL: function(url) {
        // Usar proxy CORS para desenvolvimento local
        // Em produção, não usar proxy
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        }
        return url;
    },

    // Buscar todos os leads
    getLeads: async function() {
        const url = this.getAppsScriptURL();
        
        if (!url) {
            throw new Error('URL do Google Apps Script não configurada. Configure a variável de ambiente GOOGLE_APPS_SCRIPT_URL no config.js ou na Vercel.');
        }
        
        try {
            const proxyURL = this.getProxyURL(`${url}?action=getLeads`);
            const response = await fetch(proxyURL, {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
            throw error;
        }
    },

    // Salvar novo lead
    saveLead: async function(leadData) {
        const url = this.getAppsScriptURL();
        
        if (!url) {
            throw new Error('URL do Google Apps Script não configurada. Configure a variável de ambiente GOOGLE_APPS_SCRIPT_URL no config.js ou na Vercel.');
        }
        
        try {
            const proxyURL = this.getProxyURL(url);
            const response = await fetch(proxyURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'saveLead',
                    data: leadData
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result.success || true;
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            throw error;
        }
    }
};
