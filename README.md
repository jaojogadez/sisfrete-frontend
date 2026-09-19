# 🎨 Sisfrete Frontend — Interface Web (UI Only)

Interface web pura para análise de dados de frete. **Apenas frontend — sem conexão com API ainda.**

Desenvolvido pelo **Grupo 08** | **Hackathon:** Unimar Tech Summit 2026

---

## ⚠️ Status Atual

```
┌─────────────────────────────────────────┐
│  ✅ UI/UX Completa                       │
│  ✅ Gráficos e Tabelas Funcionais        │
│  ✅ Sistema de Filtros Operacional       │
│  ✅ Responsive Design                    │
│  ❌ SEM conexão com API OpenSearch       │
│  ❌ Dados MOCKADOS / SIMULADOS           │
│  ⏳ Integração com backend em desenvolvimento
└─────────────────────────────────────────┘
```

**Este é apenas o frontend.** Os dados mostrados são fictícios (gerados aleatoriamente em JavaScript). Para usar dados reais, veja a [integração com o backend](#-integração-com-o-backend).

---

## 🚀 Início Rápido

### Não precisa instalar nada!

Apenas abra o arquivo em um navegador:

```bash
# Opção 1: Abrir direto no navegador
# Clique duplo em index.html (Windows/Mac)
# ou arraste para um navegador aberto

# Opção 2: Servir localmente (recomendado)
python -m http.server 8000
# Acesse http://localhost:8000
```

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Nenhuma dependência de backend

---

## 🎯 O que tem

### Seções da Interface

#### 1️⃣ **Visão Geral**
- Dashboard com KPIs principais
- Volume total de cotações
- Preço médio e prazo médio
- Distribuição por canal
- Histórico semanal

#### 2️⃣ **Análise de Frete**
- Tabela interativa de cotações
- Filtros avançados (estado, transportadora, canal, preço, peso, prazo)
- Gráficos de distribuição
- Análise de volume por semana
- Correlação preço × prazo

#### 3️⃣ **Transportadoras**
- Ranking por preço (mais barata)
- Ranking por prazo (mais rápida)
- Análise de competitividade
- Cobertura por estado
- Custo-benefício

#### 4️⃣ **Regiões**
- Mapa de distribuição geográfica
- Volume por estado
- Preço médio regional
- Prazo médio por região
- Cidades principais

#### 5️⃣ **Canais de Venda**
- Volume por canal (marketplace, site próprio, etc)
- Evolução temporal
- Ticket médio por canal
- Comparativo de performance

---

## 📁 Estrutura

```
sisfrete-frontend/
├── index.html              # Página HTML única (SPA)
├── src/
│   ├── style.css          # Estilos (Dark theme Sisfrete)
│   ├── script.js          # Lógica, gráficos, dados mockados
│   └── sisfrete-logo.png  # Logo da marca
├── LICENSE                # MIT License
└── README.md             # Este arquivo
```

### Arquivos Importantes

#### **index.html** — Página Principal
- Single Page Application (SPA)
- Sidebar com navegação
- Container para diferentes abas (pages)
- Sem build process — tudo é vanilla HTML/CSS/JS

#### **src/style.css** — Estilos
- Design system com variáveis CSS
- Tema escuro com verde Sisfrete (#2D8659)
- Responsive (mobile, tablet, desktop)
- Components: cards, tabelas, gráficos, filtros

#### **src/script.js** — Lógica
- **Dados mockados:** `mockData.quotations` (aleatório)
- **Gráficos:** Chart.js para visualizações
- **Filtros:** Sistema de filtros funcional
- **Navegação:** Switching entre páginas
- **Sem chamadas HTTP** — tudo em memória

---

## 📊 Dados Mockados

Os dados são **100% fictícios**, gerados aleatoriamente em JavaScript:

```javascript
// Estrutura de cada cotação
{
  state: "SP",                    // Estado (UF)
  carrier: "Sedex",              // Transportadora
  channel: "Marketplace",        // Canal de venda
  price: 45,                     // Preço (R$)
  deadline: 5,                   // Prazo (dias)
  weight: 2.5,                   // Peso (kg)
  volume: 0.015,                 // Volume (m³)
  day: 15,                       // Dia do mês
  week: 3                        // Semana (1-4)
}
```

**Transportadoras simuladas:**
- Sedex, PAC, JADLOG, Via Brasil, Loggi, Inpost

**Estados:** SP, MG, RJ, BA, RS, SC, PR, PE, GO, DF

**Canais:** Marketplace, Website, Mobile App, B2B

---

## 🎮 Como Usar

### Navegação Básica

1. **Clique nos itens do menu** (Visão Geral, Análise de Frete, etc)
2. **Use os filtros** para refinar dados:
   - 🔽 Abra a barra de filtros
   - ⚙️ Selecione critérios
   - ✅ Clique "Aplicar"
   - 🔄 Ou limpe filtros

### Interação com Gráficos

- **Hover:** Veja detalhes
- **Click:** Alguns gráficos permitem zoom/drill-down
- **Reativo:** Filtros atualizam gráficos automaticamente

### Responsividade

- ✅ Desktop (1200px+)
- ✅ Tablet (768px-1199px)
- ✅ Mobile (< 768px)

---

## 🔌 Integração com o Backend

### Como Conectar à API Real

Atualmente o `script.js` gera dados aleatórios. Para conectar ao backend real:

#### Opção 1: Backend Python (Streamlit/OpenSearch)
```javascript
// Em src/script.js, substituir generateMockQuotations() por:

async function fetchRealQuotations() {
    const response = await fetch('http://localhost:8000/api/quotations');
    const data = await response.json();
    return data.quotations; // Adapte ao schema real
}

// Alterar inicialização
async function initialize() {
    mockData.quotations = await fetchRealQuotations();
    initCharts();
}
```

#### Opção 2: Backend Node.js/Express
```javascript
// Configure endpoint
const API_BASE = 'http://seu-backend.com/api';

async function getQuotations(filters) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE}/quotations?${params}`);
    return await response.json();
}
```

#### Opção 3: Backend FastAPI
```javascript
// Requisição para backend Python
const response = await fetch('http://localhost:8000/api/lojas/12345/cotacoes', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});
```

### Schema Esperado da API

A interface espera dados neste formato:

```json
{
  "quotations": [
    {
      "state": "SP",
      "carrier": "Sedex",
      "channel": "Marketplace",
      "price": 45.90,
      "deadline": 5,
      "weight": 2.5,
      "volume": 0.015,
      "day": 15,
      "week": 3
    }
  ],
  "summary": {
    "total": 1245000,
    "avgPrice": 48.50,
    "avgDeadline": 6.2
  }
}
```

---

## 🎨 Customização

### Mudar Cores da Marca

Edite `src/style.css`:

```css
:root {
  --primary-color: #2D8659;      /* Verde Sisfrete */
  --secondary-color: #1F5A3D;
  --accent-color: #FF6B35;
  --background-dark: #0F1419;
  --background-card: #1A1F26;
  --text-primary: #FFFFFF;
}
```

### Adicionar Novas Abas

Em `index.html`:

```html
<!-- 1. Adicionar item de menu -->
<li class="nav-item">
  <a class="nav-link" onclick="showPage('nova-aba')">
    <svg class="nav-icon">...</svg>
    <span>Nova Aba</span>
  </a>
</li>

<!-- 2. Adicionar conteúdo -->
<div id="nova-aba" class="page" style="display: none;">
  <h2>Minha Nova Aba</h2>
  <!-- Conteúdo aqui -->
</div>

<!-- 3. Adicionar lógica em script.js -->
function updateNovaAba() {
  // Lógica para atualizar dados
}
```

### Adicionar Novos Gráficos

```javascript
// Em src/script.js
function createMyChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    charts.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar'],
            datasets: [{
                label: 'Meu Gráfico',
                data: [10, 20, 30],
                borderColor: 'var(--primary-color)'
            }]
        }
    });
}
```

---

## 📦 Dependências

Apenas **CDN externo**:

```html
<!-- Chart.js (Gráficos) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>

<!-- Google Fonts (Typography) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
```

**Nenhuma dependência npm/pip necessária!**

---

## 🔄 Próximos Passos (Roadmap)

- [ ] Conectar com backend Python (dados.py)
- [ ] Autenticação/Login
- [ ] Exportar para CSV/PDF
- [ ] Relatórios customizáveis
- [ ] Modo dark/light theme
- [ ] Internacionalização (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Notifications em tempo real

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Página em branco | Abra console (F12), verifique erros |
| Gráficos não aparecem | Verifique conexão CDN Chart.js |
| Filtros não funcionam | Atualize `script.js`, limpe cache |
| Dados estranhos | É esperado — dados são aleatórios! |

---

## 📚 Tecnologias

- **HTML5** — Semântica
- **CSS3** — Flexbox, Grid, Variáveis CSS
- **JavaScript (ES6+)** — Vanilla JS (sem frameworks)
- **Chart.js** — Gráficos interativos

---

## 📝 Licença

MIT License — Veja arquivo `LICENSE`

---

## 🤝 Relacionado

- 📡 **Backend:** [sisfrete](https://github.com/jaojogadez/sisfrete-backend) — Cliente OpenSearch + Streamlit
- 🎯 **Hackathon:** Unimar Tech Summit 2026

---

## 💬 Notas

- ✅ **UI Completa** — Pronto para produção (em termos de interface)
- ✅ **Sem backend** — Funciona offline com dados mock
- ❌ **Não use em produção** — Dados são ficcionais
- ⏳ **Aguardando integração** — Conecte ao backend real em breve

---

**Desenvolvido com ❤️ em HTML/CSS/JavaScript**

*Próximo passo: Conectar ao backend Python!* 🔌
