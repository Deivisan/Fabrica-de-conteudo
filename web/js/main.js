// MCP - Marketing Content Platform Interface Web
// Arquivo: js/main.js

class MCPDashboard {
    constructor() {
        this.apiEndpoint = 'http://localhost:3001'; // Endpoint da API MCP
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDashboardData();
        this.setupNavigation();
    }

    bindEvents() {
        // Botões do painel
        document.getElementById('updateTrendsBtn').addEventListener('click', () => this.updateTrends());
        document.getElementById('processStrategiesBtn').addEventListener('click', () => this.processStrategies());
        document.getElementById('createCustomAPIBtn').addEventListener('click', () => this.showCreateAPIPopup());
        
        // Formulários
        document.getElementById('contentGenerationForm').addEventListener('submit', (e) => this.generateContent(e));
        document.getElementById('apiCreationForm').addEventListener('submit', (e) => this.createAPI(e));
        document.getElementById('scrapingForm').addEventListener('submit', (e) => this.performScraping(e));
        document.getElementById('strategyForm').addEventListener('submit', (e) => this.saveStrategy(e));
        
        // Botões modais
        document.getElementById('saveStrategyBtn').addEventListener('click', () => this.saveStrategy());
        document.getElementById('addStrategyBtn').addEventListener('click', () => this.showStrategyModal());
        
        // Busca de estratégias
        document.getElementById('searchStrategies').addEventListener('input', (e) => this.searchStrategies(e.target.value));
        document.getElementById('filterStatus').addEventListener('change', (e) => this.filterStrategies(e.target.value));
    }

    setupNavigation() {
        // Ativa navegação entre abas
        const triggers = document.querySelectorAll('a[href^="#"]');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = trigger.getAttribute('href').substring(1);
                this.activateTab(targetId);
            });
        });
    }

    activateTab(tabId) {
        // Remove a classe 'active' de todas as abas e links
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active', 'show');
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Adiciona a classe 'active' à aba e link específicos
        document.getElementById(tabId).classList.add('active', 'show');
        document.querySelector(`a[href="#${tabId}"]`).classList.add('active');
        
        // Carrega dados específicos da aba, se necessário
        switch(tabId) {
            case 'strategies':
                this.loadStrategies();
                break;
            case 'content':
                this.loadContentHistory();
                break;
            case 'apis':
                this.loadAPIs();
                break;
            case 'scraping':
                this.loadScrapingHistory();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Simular carregamento de dados do dashboard
            document.getElementById('totalStrategies').textContent = '12';
            document.getElementById('totalContent').textContent = '47';
            document.getElementById('activeAPIsCard').textContent = '5';
            
            // Atualizar contadores laterais
            document.getElementById('strategyCount').textContent = '12';
            document.getElementById('contentCount').textContent = '47';
            document.getElementById('activeAPIs').textContent = '5';
            
            // Carregar atividades recentes
            this.loadRecentActivities();
            
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        }
    }

    async loadRecentActivities() {
        const activitiesList = document.getElementById('activitiesList');
        const activities = [
            { action: 'Estratégia atualizada', details: 'Campanha de verão foi atualizada automaticamente', time: '2 min atrás' },
            { action: 'Conteúdo gerado', details: '5 posts gerados para Instagram', time: '10 min atrás' },
            { action: 'API criada', details: 'Nova API de geração de imagens criada', time: '15 min atrás' },
            { action: 'Tendência detectada', details: 'Novas tendências em "marketing digital" identificadas', time: '30 min atrás' },
            { action: 'Conteúdo publicado', details: 'Vídeo publicado no YouTube', time: '1 hora atrás' }
        ];

        activitiesList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>${activity.action}</strong><br>
                        <small class="text-muted">${activity.details}</small>
                    </div>
                    <div class="text-end">
                        <small class="text-muted">${activity.time}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadStrategies() {
        const strategiesList = document.getElementById('strategiesList');
        
        // Simular carregamento de estratégias
        const strategies = [
            { id: 1, title: 'Campanha de Lançamento - Produto Inovador', status: 'active', lastModified: '2025-01-15', type: 'marketing' },
            { id: 2, title: 'Estratégia de Conteúdo para Black Friday', status: 'active', lastModified: '2025-01-10', type: 'ecommerce' },
            { id: 3, title: 'Campanha de Engajamento para Redes Sociais', status: 'pending', lastModified: '2025-01-05', type: 'social' },
            { id: 4, title: 'Estratégia de SEO e Conteúdo para Blog', status: 'inactive', lastModified: '2024-12-28', type: 'seo' }
        ];

        strategiesList.innerHTML = strategies.map(strategy => `
            <div class="strategy-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6>${strategy.title}</h6>
                        <div class="d-flex gap-2">
                            <span class="badge bg-${this.getStatusBadgeColor(strategy.status)}">
                                <span class="status-indicator status-${strategy.status}"></span>
                                ${this.getStatusText(strategy.status)}
                            </span>
                            <span class="badge bg-secondary">${strategy.type}</span>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="mcp.showStrategyModal(${strategy.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="mcp.deleteStrategy(${strategy.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <small class="text-muted">Última modificação: ${strategy.lastModified}</small>
            </div>
        `).join('');
    }

    getStatusBadgeColor(status) {
        switch(status) {
            case 'active': return 'success';
            case 'inactive': return 'secondary';
            case 'pending': return 'warning';
            default: return 'secondary';
        }
    }

    getStatusText(status) {
        switch(status) {
            case 'active': return 'Ativa';
            case 'inactive': return 'Inativa';
            case 'pending': return 'Pendente';
            default: return status;
        }
    }

    async loadContentHistory() {
        // Simular histórico de conteúdo gerado
        const generatedContent = document.getElementById('generatedContent');
        generatedContent.innerHTML = `
            <div class="alert alert-info">
                <strong>Dica:</strong> Use o formulário acima para gerar conteúdo personalizado usando diferentes provedores de IA.
            </div>
        `;
    }

    async loadAPIs() {
        const apiList = document.getElementById('apiList');
        
        // Simular carregamento de APIs
        const apis = [
            { id: 1, name: 'Gerador de Posts', type: 'text', endpoint: '/api/posts', status: 'active' },
            { id: 2, name: 'Gerador de Imagens', type: 'image', endpoint: '/api/images', status: 'active' },
            { id: 3, name: 'Coletor de Tendências', type: 'scrape', endpoint: '/api/trends', status: 'active' }
        ];

        apiList.innerHTML = apis.map(api => `
            <div class="api-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${api.name} <span class="badge bg-info">${api.type}</span></h6>
                        <small class="text-muted">${api.endpoint}</small>
                    </div>
                    <div>
                        <span class="badge bg-success me-2">${this.getStatusText(api.status)}</span>
                        <button class="btn btn-sm btn-outline-danger" onclick="mcp.deleteAPI(${api.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadScrapingHistory() {
        // Simular histórico de scraping
        const scrapingResults = document.getElementById('scrapingResults');
        scrapingResults.innerHTML = `
            <div class="alert alert-info">
                <strong>Dica:</strong> Digite uma URL ou termo de busca para analisar tendências e conteúdo relevante da web.
            </div>
        `;
    }

    async updateTrends() {
        const btn = document.getElementById('updateTrendsBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Atualizando...';
        btn.disabled = true;

        try {
            // Simular atualização de tendências
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Tendências atualizadas com sucesso!', 'success');
            
            // Adicionar atividade
            this.addActivity('Tendências atualizadas', 'Análise de tendências da web concluída');
        } catch (error) {
            this.showNotification('Erro ao atualizar tendências', 'error');
        } finally {
            btn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Atualizar Tendências';
            btn.disabled = false;
        }
    }

    async processStrategies() {
        const btn = document.getElementById('processStrategiesBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
        btn.disabled = true;

        try {
            // Simular processamento de estratégias
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            this.showNotification('Estratégias processadas com sucesso!', 'success');
            
            // Adicionar atividade
            this.addActivity('Estratégias processadas', '6 estratégias foram processadas e conteúdo gerado');
        } catch (error) {
            this.showNotification('Erro ao processar estratégias', 'error');
        } finally {
            btn.innerHTML = '<i class="fas fa-play-circle me-2"></i>Processar Estratégias';
            btn.disabled = false;
        }
    }

    showCreateAPIPopup() {
        // Simular criação de API
        const name = prompt('Nome da nova API:');
        if (name) {
            const type = prompt('Tipo (text, image, video, scrape):');
            if (type) {
                this.createAPI({ preventDefault: () => {} }, name, type);
            }
        }
    }

    async createAPI(event, name, type) {
        if (event) event.preventDefault();
        
        const apiName = name || document.getElementById('apiName').value;
        const apiType = type || document.getElementById('apiType').value;
        
        if (!apiName || !apiType) {
            this.showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        try {
            // Simular criação de API
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showNotification(`API "${apiName}" criada com sucesso!`, 'success');
            
            // Limpar formulário
            document.getElementById('apiName').value = '';
            
            // Adicionar atividade
            this.addActivity('API criada', `Nova API de ${apiType} criada: ${apiName}`);
            
            // Recarregar lista de APIs se estiver na aba correta
            if (document.getElementById('apis').classList.contains('active')) {
                this.loadAPIs();
            }
        } catch (error) {
            this.showNotification('Erro ao criar API', 'error');
        }
    }

    async generateContent(event) {
        event.preventDefault();
        
        const type = document.getElementById('contentType').value;
        const prompt = document.getElementById('contentPrompt').value;
        const provider = document.getElementById('aiProvider').value;
        
        if (!prompt.trim()) {
            this.showNotification('Por favor, insira um prompt', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Gerando...';
        submitBtn.disabled = true;

        try {
            // Simular geração de conteúdo
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Simular conteúdo gerado
            const generatedText = `Conteúdo gerado usando ${provider} para: ${prompt.substring(0, 50)}...`;
            
            const generatedContent = document.getElementById('generatedContent');
            generatedContent.innerHTML = `
                <div class="alert alert-success">
                    <h6><i class="fas fa-check-circle me-2"></i>Conteúdo Gerado</h6>
                    <p>${generatedText}</p>
                    <small class="text-muted">Gerado com ${provider} usando modelo de IA</small>
                </div>
            `;
            
            this.showNotification('Conteúdo gerado com sucesso!', 'success');
            
            // Adicionar atividade
            this.addActivity('Conteúdo gerado', `Novo conteúdo de ${type} gerado via ${provider}`);
        } catch (error) {
            this.showNotification('Erro ao gerar conteúdo', 'error');
        } finally {
            submitBtn.innerHTML = '<i class="fas fa-bolt me-2"></i>Gerar Conteúdo';
            submitBtn.disabled = false;
        }
    }

    async performScraping(event) {
        event.preventDefault();
        
        const input = document.getElementById('scrapingInput').value;
        
        if (!input.trim()) {
            this.showNotification('Por favor, insira uma URL ou termo de busca', 'error');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Analizando...';
        submitBtn.disabled = true;

        try {
            // Simular scraping
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            // Simular resultados de scraping
            const scrapingResults = document.getElementById('scrapingResults');
            scrapingResults.innerHTML = `
                <div class="alert alert-info">
                    <h6><i class="fas fa-search me-2"></i>Resultados da Análise</h6>
                    <p>Análise de tendências para: <strong>${input}</strong></p>
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Palavras-chave Encontradas:</h6>
                            <ul class="list-unstyled">
                                <li><span class="badge bg-primary me-1">inteligência artificial</span></li>
                                <li><span class="badge bg-primary me-1">marketing digital</span></li>
                                <li><span class="badge bg-primary me-1">automação de conteúdo</span></li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6>Sentimento Geral:</h6>
                            <p>Positivo - 78%</p>
                        </div>
                    </div>
                </div>
            `;
            
            this.showNotification('Análise de scraping concluída!', 'success');
            
            // Adicionar atividade
            this.addActivity('Scraping realizado', `Análise de tendências para: ${input}`);
        } catch (error) {
            this.showNotification('Erro ao analisar conteúdo', 'error');
        } finally {
            submitBtn.innerHTML = '<i class="fas fa-search me-2"></i>Analizar Tendências';
            submitBtn.disabled = false;
        }
    }

    showStrategyModal(strategyId = null) {
        if (strategyId) {
            // Carregar dados da estratégia existente
            document.getElementById('strategyTitle').value = 'Campanha de Lançamento - Produto Inovador';
            document.getElementById('strategyDescription').value = 'Estratégia para promover o novo produto inovador';
            document.getElementById('strategyContent').value = '# Campanha de Lançamento - Produto Inovador\n\n## Objetivo\nPromover o novo Produto Inovador...';
            document.querySelector('.modal-title').textContent = 'Editar Estratégia';
        } else {
            // Limpar formulário para nova estratégia
            document.getElementById('strategyForm').reset();
            document.querySelector('.modal-title').textContent = 'Adicionar Estratégia';
        }
        
        const modal = new bootstrap.Modal(document.getElementById('strategyModal'));
        modal.show();
    }

    async saveStrategy() {
        const title = document.getElementById('strategyTitle').value;
        const description = document.getElementById('strategyDescription').value;
        const content = document.getElementById('strategyContent').value;
        
        if (!title.trim()) {
            this.showNotification('Por favor, insira um título', 'error');
            return;
        }

        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showNotification('Estratégia salva com sucesso!', 'success');
            
            // Fechar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('strategyModal'));
            modal.hide();
            
            // Adicionar atividade
            this.addActivity('Estratégia salva', `Nova estratégia adicionada: ${title}`);
            
            // Recarregar lista de estratégias se estiver na aba correta
            if (document.getElementById('strategies').classList.contains('active')) {
                this.loadStrategies();
            }
        } catch (error) {
            this.showNotification('Erro ao salvar estratégia', 'error');
        }
    }

    async deleteStrategy(strategyId) {
        if (confirm('Tem certeza que deseja excluir esta estratégia?')) {
            try {
                // Simular exclusão
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                this.showNotification('Estratégia excluída com sucesso!', 'success');
                
                // Recarregar lista de estratégias
                this.loadStrategies();
            } catch (error) {
                this.showNotification('Erro ao excluir estratégia', 'error');
            }
        }
    }

    async deleteAPI(apiId) {
        if (confirm('Tem certeza que deseja excluir esta API?')) {
            try {
                // Simular exclusão
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                this.showNotification('API excluída com sucesso!', 'success');
                
                // Recarregar lista de APIs
                this.loadAPIs();
            } catch (error) {
                this.showNotification('Erro ao excluir API', 'error');
            }
        }
    }

    searchStrategies(query) {
        // Simular busca de estratégias
        this.loadStrategies();
    }

    filterStrategies(status) {
        // Simular filtro de estratégias
        this.loadStrategies();
    }

    addActivity(action, details) {
        // Adiciona uma nova atividade à lista
        const activitiesList = document.getElementById('activitiesList');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="d-flex justify-content-between">
                <div>
                    <strong>${action}</strong><br>
                    <small class="text-muted">${details}</small>
                </div>
                <div class="text-end">
                    <small class="text-muted">Agora mesmo</small>
                </div>
            </div>
        `;
        
        activitiesList.insertBefore(activityItem, activitiesList.firstChild);
    }

    showNotification(message, type = 'info') {
        // Criar notificação toast
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'bg-danger text-white' : type === 'success' ? 'bg-success text-white' : 'bg-info text-white'}`;
        toast.setAttribute('role', 'alert');
        
        toast.innerHTML = `
            <div class="toast-body">
                ${message}
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toastContainer);
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remover notificação após mostrar
        setTimeout(() => {
            if (toastContainer.parentNode) {
                toastContainer.parentNode.removeChild(toastContainer);
            }
        }, 5000);
    }

    // Funções para integração real com a API MCP
    async callMCPEndpoint(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.apiEndpoint}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na chamada da API:', error);
            throw error;
        }
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.mcp = new MCPDashboard();
});

// Exportar para módulo se estiver em ambiente Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MCPDashboard;
}