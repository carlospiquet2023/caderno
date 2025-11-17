# 🔧 GUIA TÉCNICO DE IMPLEMENTAÇÃO

## Arquitetura do Sistema

### 1. Gerenciador de Cadernos (GerenciadorCadernos Class)

```javascript
class GerenciadorCadernos {
    constructor()          // Inicializa e carrega dados
    carregarCadernos()    // Carrega do LocalStorage
    obterCadernos()       // Retorna objeto de cadernos
    salvarCadernos(data)  // Salva no LocalStorage
    atualizarSelector()   // Atualiza UI do seletor
    carregarCadernoAtual() // Carrega caderno na tela
    salvarCadernoAtual()  // Salva caderno atual
    novoCaderno()         // Cria novo caderno
    deletarCaderno()      // Remove caderno
    trocarCaderno(id)     // Alterna entre cadernos
    iniciarAutoSave()     // Configura salvamento automático
}
```

### 2. Estrutura de Dados

#### Caderno Object
```javascript
{
    id: 'caderno-1234567890',
    nome: 'Meu Caderno',
    data: '2025-11-17',
    materia: 'Matemática',
    conteudo: 'HTML string...',
    fonte: 'font-kalam',
    criadoEm: 1700227200000,
    atualizadoEm: 1700227200000
}
```

#### LocalStorage Keys
```javascript
'cadernos'       // JSON string com todos os cadernos
'ultimoCaderno'  // ID do último caderno acessado
```

### 3. Sistema de Auto-Save

#### Triggers de Salvamento
- **Timer**: A cada 10 segundos
- **Blur**: Quando perde foco do conteúdo
- **Change**: Alteração em data/matéria
- **beforeunload**: Antes de fechar página
- **Trocar caderno**: Ao alternar entre cadernos

```javascript
// Auto-save periódico
setInterval(() => salvarCadernoAtual(), 10000);

// Eventos críticos
window.addEventListener('beforeunload', () => salvar());
elemento.addEventListener('blur', () => salvar());
```

### 4. Service Worker (PWA)

#### Cache Strategy
```javascript
// Cache Name
const CACHE_NAME = 'caderno-digital-v1';

// Assets Cached
- index.html
- manifest.json
- Tailwind CSS
- html2pdf.js
- Google Fonts

// Strategy: Cache First, Fallback to Network
```

#### Lifecycle
1. **Install**: Cria cache inicial
2. **Activate**: Remove caches antigos
3. **Fetch**: Intercepta requisições
   - Cache hit → Retorna do cache
   - Cache miss → Busca na rede e cacheia

### 5. Integração com IA (Google Gemini)

#### Fluxo
```
1. Usuário clica "Continuar com IA"
2. Extrai texto do caderno
3. Monta prompt
4. Faz POST para API Gemini
5. Implementa retry exponencial
6. Processa resposta
7. Adiciona ao caderno com formatação
```

#### Retry Logic
```javascript
let retries = 0;
let delay = 1000;

while (retries < 3) {
    response = await fetch(url);
    if (response.ok) break;
    
    if (response.status === 429 || response.status >= 500) {
        await sleep(delay);
        delay *= 2;
        retries++;
    }
}
```

### 6. Exportação PDF

#### Pipeline
```
1. Clona conteúdo do caderno
2. Cria container com cabeçalho
3. Formata data e matéria
4. Gera nome do arquivo
5. Configura opções html2pdf
6. Executa conversão
7. Baixa arquivo
```

#### Configuração
```javascript
{
    margin: 0.5,
    filename: 'Matematica_2025-11-17.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
}
```

### 7. Responsividade

#### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 3.5rem 1rem 1rem 2.5rem;
}

/* Touch Devices */
@media (hover: none) and (pointer: coarse) {
    min-height: 44px; /* WCAG compliance */
}
```

#### Mobile Optimizations
- Texto menor mas legível
- Padding reduzido
- Labels ocultas em botões
- Linhas do caderno proporcionais
- Seletor de fonte compacto

### 8. Audio Synthesis

#### Som de Virar Página
```javascript
// Oscilador com envelope
frequency: 100Hz → 200Hz → 50Hz
type: 'sawtooth'
gain: 0 → 0.15 → 0.01
duration: 0.4s
```

### 9. Segurança

#### Content Security Policy
```
script-src: 'self' 'unsafe-inline' cdn.tailwindcss.com
style-src: 'self' 'unsafe-inline' fonts.googleapis.com
connect-src: generativelanguage.googleapis.com
```

#### Input Sanitization
```javascript
function sanitizarTexto(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML; // Escapa HTML
}
```

### 10. Performance

#### Optimizations
- **Lazy Loading**: Service Worker cacheia recursos
- **Debounce**: Auto-save com intervalo
- **Event Delegation**: Poucos listeners
- **Minimal DOM**: Apenas elementos necessários
- **CSS Transitions**: Animações via GPU

## Fluxo de Uso Completo

### 1. Primeira Visita
```
1. Carrega index.html
2. Registra Service Worker
3. Verifica LocalStorage
4. Cria caderno padrão se vazio
5. Carrega caderno na tela
6. Inicia auto-save
```

### 2. Uso Normal
```
1. Usuário digita no caderno
2. Auto-save a cada 10s
3. Pode trocar fonte → Salva
4. Pode criar nova página → Salva antes
5. Pode exportar PDF
6. Pode usar IA para continuar
```

### 3. Múltiplos Cadernos
```
1. Clicar "+" → Prompt nome
2. Cria novo caderno
3. Adiciona ao LocalStorage
4. Atualiza seletor
5. Carrega novo caderno

// Trocar
1. Seleciona no dropdown
2. Salva caderno atual
3. Carrega novo caderno
4. Efeito visual de virar
```

### 4. Instalação PWA
```
1. Navegador detecta manifest.json
2. Mostra prompt de instalação
3. Usuário aceita
4. Service Worker ativa
5. Ícone adicionado à home
6. App funciona offline
```

## Estrutura de Arquivos Detalhada

```
caderno/
│
├── index.html (745 linhas)
│   ├── <head>
│   │   ├── Meta tags (PWA, responsividade)
│   │   ├── Tailwind CSS
│   │   ├── html2pdf.js
│   │   └── Google Fonts
│   │
│   ├── <style>
│   │   ├── Fontes personalizadas
│   │   ├── Aparência do caderno
│   │   ├── Efeito 3D flip
│   │   ├── Animações
│   │   └── Media queries
│   │
│   ├── <body>
│   │   ├── Barra de navegação (cadernos)
│   │   ├── Controles (fonte, IA, PDF)
│   │   ├── Cabeçalho do caderno
│   │   └── Área editável
│   │
│   └── <script>
│       ├── GerenciadorCadernos class
│       ├── tocarSomPagina()
│       ├── Event listeners
│       ├── Lógica de fonte
│       ├── Exportar PDF
│       ├── Integração IA
│       └── Service Worker registration
│
├── manifest.json
│   ├── name, short_name
│   ├── icons (192, 512)
│   ├── theme_color
│   └── display: standalone
│
├── service-worker.js
│   ├── Cache assets
│   ├── Install event
│   ├── Activate event
│   ├── Fetch event
│   └── Sync event
│
├── icon-192.svg
├── icon-512.svg
└── README.md
```

## Customização Rápida

### Mudar Cores
```javascript
// Busque e substitua
bg-indigo-600 → bg-blue-600
bg-green-600 → bg-emerald-600
bg-purple-600 → bg-violet-600
```

### Adicionar Fonte
```html
<!-- No <head> -->
<link href="https://fonts.googleapis.com/css2?family=NovaFonte&display=swap" rel="stylesheet">

<!-- No <style> -->
.font-nova { font-family: 'NovaFonte', cursive; }

<!-- No <select> -->
<option value="font-nova">Nova Fonte</option>

<!-- No array classesDeFonte -->
const classesDeFonte = [..., 'font-nova'];
```

### Ajustar Auto-save
```javascript
// Mudar intervalo (ms)
setInterval(() => salvar(), 5000); // 5 segundos
```

### Modificar Limite de Cadernos
```javascript
if (Object.keys(cadernos).length >= 50) {
    alert('Limite de 50 cadernos atingido!');
    return;
}
```

## Debugging

### Ver Dados Salvos
```javascript
// Console do navegador
console.log(JSON.parse(localStorage.getItem('cadernos')));
console.log(localStorage.getItem('ultimoCaderno'));
```

### Limpar Dados
```javascript
localStorage.clear();
location.reload();
```

### Verificar Service Worker
```
Chrome DevTools → Application → Service Workers
```

### Verificar Cache
```
Chrome DevTools → Application → Cache Storage
```

## Deploy

### Opção 1: GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin URL
git push -u origin main

# Settings → Pages → Deploy from main
```

### Opção 2: Netlify
```bash
# Drag & drop da pasta
# ou
netlify deploy --prod
```

### Opção 3: Vercel
```bash
vercel --prod
```

## Checklist Pré-Deploy

- [ ] API Key configurada (ou removida)
- [ ] Ícones PNG criados (192x192, 512x512)
- [ ] Manifest.json com URLs corretas
- [ ] Service Worker com paths corretos
- [ ] Testado em mobile
- [ ] Testado offline
- [ ] Instalação PWA testada
- [ ] Exportar PDF testado
- [ ] Auto-save funcionando
- [ ] Múltiplos cadernos testados

---

**Projeto pronto para produção!** 🚀
