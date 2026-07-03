// Estado da aplicação
let leadsData = [];
let salesFunnelChart = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    loadLeads();
    setupForm();
});

// Inicializar gráfico do funil de vendas
function initializeChart() {
    const ctx = document.getElementById('salesFunnel').getContext('2d');
    
    salesFunnelChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Prospecto', 'Atendimento', 'Visita', 'Venda'],
            datasets: [{
                label: 'Quantidade',
                data: [0, 0, 0, 0],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Carregar leads do Google Apps Script
async function loadLeads() {
    try {
        const data = await api.getLeads();
        leadsData = data || [];
        updateMetrics();
        updateChart();
    } catch (error) {
        console.error('Erro ao carregar leads:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
}

// Configurar formulário
function setupForm() {
    const form = document.getElementById('lead-form');
    form.addEventListener('submit', handleFormSubmit);
}

// Manipular envio do formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        contactMethod: document.getElementById('contact-method').value,
        stage: document.getElementById('stage').value,
        value: parseFloat(document.getElementById('value').value) || 0
    };

    try {
        await api.saveLead(formData);
        leadsData.push(formData);
        updateMetrics();
        updateChart();
        showNotification('Cadastro realizado com sucesso!', 'success');
        document.getElementById('lead-form').reset();
    } catch (error) {
        console.error('Erro ao salvar lead:', error);
        showNotification('Erro ao salvar cadastro', 'error');
    }
}

// Atualizar métricas
function updateMetrics() {
    const totalContacts = leadsData.length;
    const totalVisits = leadsData.filter(lead => lead.stage === 'visita').length;
    const sales = leadsData.filter(lead => lead.stage === 'venda');
    const totalSales = sales.length;
    const totalSalesValue = sales.reduce((sum, sale) => sum + (sale.value || 0), 0);

    document.getElementById('total-contacts').textContent = totalContacts;
    document.getElementById('total-visits').textContent = totalVisits;
    document.getElementById('total-sales').textContent = totalSales;
    document.getElementById('total-sales-value').textContent = formatCurrency(totalSalesValue);
}

// Atualizar gráfico
function updateChart() {
    const funnelData = {
        prospecto: leadsData.filter(lead => lead.stage === 'prospecto').length,
        atendimento: leadsData.filter(lead => lead.stage === 'atendimento').length,
        visita: leadsData.filter(lead => lead.stage === 'visita').length,
        venda: leadsData.filter(lead => lead.stage === 'venda').length
    };

    salesFunnelChart.data.datasets[0].data = [
        funnelData.prospecto,
        funnelData.atendimento,
        funnelData.visita,
        funnelData.venda
    ];
    
    salesFunnelChart.update();
}

// Formatar moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Mostrar notificação
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    
    notification.className = `notification ${type}`;
    messageElement.textContent = message;
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}
