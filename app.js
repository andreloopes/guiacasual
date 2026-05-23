/**
 * app.js - Premium Dining Guide Interactive Logic
 * Inspired by the NY Times Dining Guides
 */

// Application State
const state = {
  restaurants: [],
  filteredRestaurants: [],
  viewMode: 'list', // 'list' or 'grid'
  showMyPicksOnly: false,
  searchTerm: '',
  activeFilters: {
    city: [],
    cuisine: [],
    price: [],
    status: []
  },
  // My picks schema: { [rank]: 'visited' | 'wantToGo' }
  myPicks: {},
  // Lists of unique values for filters
  uniqueCities: [],
  uniqueCuisines: []
};

// LocalStorage Keys
const STORAGE_KEY = 'sp_restaurant_guide_picks_2025';

// DOM Elements
const elements = {
  container: document.getElementById('restaurants-container'),
  btnViewList: document.getElementById('btn-view-list'),
  btnViewGrid: document.getElementById('btn-view-grid'),
  btnMyPicks: document.getElementById('btn-my-picks'),
  btnClearFilters: document.getElementById('btn-clear-filters'),
  btnResetFiltersEmpty: document.getElementById('btn-reset-filters-empty'),
  searchInput: document.getElementById('search-input'),
  filterPanelsContainer: document.getElementById('filter-panels-container'),
  activeFiltersSummary: document.getElementById('active-filters-summary'),
  summaryTags: document.getElementById('summary-tags'),
  emptyState: document.getElementById('empty-state'),
  picksBadge: document.getElementById('picks-badge'),
  // Drawer
  picksDrawer: document.getElementById('picks-drawer'),
  drawerBackdrop: document.getElementById('drawer-backdrop'),
  btnCloseDrawer: document.getElementById('btn-close-drawer'),
  drawerPicksList: document.getElementById('drawer-picks-list'),
  statVisited: document.getElementById('stat-visited'),
  statWantToGo: document.getElementById('stat-want-to-go'),
  btnCopyPicks: document.getElementById('btn-copy-picks'),
  btnShareLink: document.getElementById('btn-share-link'),
  // Detail Dialog
  detailDialog: document.getElementById('detail-dialog'),
  // Toast
  toast: document.getElementById('toast')
};

// ==========================================================================
// Initialization & Data Fetching
// ==========================================================================

async function init() {
  try {
    // 1. Fetch data
    const response = await fetch('restaurants.json');
    if (!response.ok) throw new Error('Falha ao carregar dados dos restaurantes.');
    state.restaurants = await response.json();
    
    // Sort restaurants by rank ascending
    state.restaurants.sort((a, b) => a.rank - b.rank);

    // 2. Extract unique filter options
    extractUniqueValues();

    // 3. Load bookmarks/selections
    loadPicksFromStorage();

    // 4. Parse URL parameters for shared lists
    parseUrlPicks();

    // 5. Initialize UI elements (generate options checkboxes)
    generateFilterCheckboxes();

    // 6. Bind Event Listeners
    bindEventListeners();

    // 7. Update UI status elements
    updateBadge();

    // 8. Execute initial filter and render
    applyFiltersAndRender(false); // No transition on initial page mount

  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Erro ao carregar o guia. Por favor, recarregue a página.');
  }
}

function extractUniqueValues() {
  const cities = new Set();
  const cuisines = new Set();

  state.restaurants.forEach(r => {
    if (r.city) cities.add(r.city);
    if (r.cuisine) cuisines.add(r.cuisine);
  });

  state.uniqueCities = Array.from(cities).sort();
  state.uniqueCuisines = Array.from(cuisines).sort();
}

// ==========================================================================
// Checkbox Options Generator
// ==========================================================================

function generateFilterCheckboxes() {
  const cityContainer = document.getElementById('options-city');
  const cuisineContainer = document.getElementById('options-cuisine');

  // Generate City Checkboxes
  cityContainer.innerHTML = state.uniqueCities.map(city => `
    <label class="option-item">
      <input type="checkbox" value="${city}" data-filter="city" ${state.activeFilters.city.includes(city) ? 'checked' : ''}>
      <span class="option-label">${city}</span>
    </label>
  `).join('');

  // Generate Cuisine Checkboxes
  cuisineContainer.innerHTML = state.uniqueCuisines.map(cuisine => `
    <label class="option-item">
      <input type="checkbox" value="${cuisine}" data-filter="cuisine">
      <span class="option-label">${cuisine}</span>
    </label>
  `).join('');
}

// ==========================================================================
// LocalStorage & Url Share Serialization
// ==========================================================================

function loadPicksFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      state.myPicks = JSON.parse(stored);
    } catch (e) {
      state.myPicks = {};
    }
  }
}

function savePicksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.myPicks));
  updateBadge();
}

function parseUrlPicks() {
  const params = new URLSearchParams(window.location.search);
  const picksParam = params.get('picks');
  if (picksParam) {
    try {
      const items = picksParam.split(',');
      items.forEach(item => {
        const [rankStr, type] = item.split(':');
        const rank = parseInt(rankStr);
        if (rank && (type === 'visited' || type === 'wantToGo')) {
          state.myPicks[rank] = type;
        }
      });
      // Save newly imported URL picks to local storage
      savePicksToStorage();
      showToast('Lista compartilhada importada com sucesso!');
      
      // Clean up URL query param to clean the experience
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.error('Error parsing URL picks:', e);
    }
  }
}

function generateShareUrl() {
  const entries = Object.entries(state.myPicks);
  if (entries.length === 0) {
    return window.location.origin + window.location.pathname;
  }
  const serialized = entries.map(([rank, type]) => `${rank}:${type}`).join(',');
  return `${window.location.origin}${window.location.pathname}?picks=${serialized}`;
}

// ==========================================================================
// Filtering Logic
// ==========================================================================

function applyFiltersAndRender(useTransition = true) {
  // Filter logic
  state.filteredRestaurants = state.restaurants.filter(r => {
    // 1. Search term match (matches name, description, or cuisine)
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      const matchSearch = r.name.toLowerCase().includes(term) || 
                          r.description.toLowerCase().includes(term) || 
                          r.cuisine.toLowerCase().includes(term) ||
                          (r.neighborhood && r.neighborhood.toLowerCase().includes(term));
      if (!matchSearch) return false;
    }

    // 2. City Filter
    if (state.activeFilters.city.length > 0) {
      if (!state.activeFilters.city.includes(r.city)) return false;
    }

    // 3. Cuisine Filter
    if (state.activeFilters.cuisine.length > 0) {
      if (!state.activeFilters.cuisine.includes(r.cuisine)) return false;
    }

    // 4. Price Filter
    if (state.activeFilters.price.length > 0) {
      if (!state.activeFilters.price.includes(r.price)) return false;
    }

    // 5. My Picks Filter (exclusive bookmark view)
    if (state.showMyPicksOnly) {
      if (!state.myPicks[r.rank]) return false;
    }

    // 6. Status Filter inside Panel
    if (state.activeFilters.status.length > 0) {
      const selection = state.myPicks[r.rank];
      const matchesStatus = state.activeFilters.status.some(status => {
        if (status === 'visited') return selection === 'visited';
        if (status === 'wantToGo') return selection === 'wantToGo';
        if (status === 'unvisited') return !selection;
        return false;
      });
      if (!matchesStatus) return false;
    }

    return true;
  });

  // Update URL state or render layout
  updateActiveFiltersSummary();

  // Execute DOM render wrapped in View Transition if supported
  if (useTransition && document.startViewTransition) {
    document.startViewTransition(() => renderCurrentView());
  } else {
    renderCurrentView();
  }
}

function updateActiveFiltersSummary() {
  const hasSearch = state.searchTerm !== '';
  const hasCity = state.activeFilters.city.length > 0;
  const hasCuisine = state.activeFilters.cuisine.length > 0;
  const hasPrice = state.activeFilters.price.length > 0;
  const hasStatus = state.activeFilters.status.length > 0;
  const showSummary = hasSearch || hasCity || hasCuisine || hasPrice || hasStatus || state.showMyPicksOnly;

  if (showSummary) {
    elements.activeFiltersSummary.classList.remove('hidden');
    elements.btnClearFilters.classList.remove('hidden');
    
    // Generate filter tags
    let tagsHTML = '';
    
    if (state.showMyPicksOnly) {
      tagsHTML += createFilterTag('Minhas Escolhas', 'myPicks');
    }
    if (state.searchTerm) {
      tagsHTML += createFilterTag(`Busca: "${state.searchTerm}"`, 'search');
    }
    state.activeFilters.city.forEach(c => {
      tagsHTML += createFilterTag(c, `city-${c}`);
    });
    state.activeFilters.cuisine.forEach(c => {
      tagsHTML += createFilterTag(c, `cuisine-${c}`);
    });
    state.activeFilters.price.forEach(p => {
      tagsHTML += createFilterTag(`Faixa ${p}`, `price-${p}`);
    });
    state.activeFilters.status.forEach(s => {
      const label = s === 'visited' ? 'Já Fui' : s === 'wantToGo' ? 'Quero Ir' : 'Não Visitados';
      tagsHTML += createFilterTag(label, `status-${s}`);
    });

    elements.summaryTags.innerHTML = tagsHTML;
  } else {
    elements.activeFiltersSummary.classList.add('hidden');
    elements.btnClearFilters.classList.add('hidden');
    elements.summaryTags.innerHTML = '';
  }
}

function createFilterTag(label, id) {
  return `
    <span class="filter-tag">
      <span>${label}</span>
      <button onclick="removeFilterTag('${id}')" aria-label="Remover filtro ${label}">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </span>
  `;
}

// Global tag removal hook
window.removeFilterTag = function(id) {
  if (id === 'myPicks') {
    state.showMyPicksOnly = false;
    elements.btnMyPicks.classList.remove('active');
  } else if (id === 'search') {
    state.searchTerm = '';
    elements.searchInput.value = '';
  } else if (id.startsWith('city-')) {
    const val = id.replace('city-', '');
    state.activeFilters.city = state.activeFilters.city.filter(x => x !== val);
    const cb = document.querySelector(`#options-city input[value="${val}"]`);
    if (cb) cb.checked = false;
  } else if (id.startsWith('cuisine-')) {
    const val = id.replace('cuisine-', '');
    state.activeFilters.cuisine = state.activeFilters.cuisine.filter(x => x !== val);
    const cb = document.querySelector(`#options-cuisine input[value="${val}"]`);
    if (cb) cb.checked = false;
  } else if (id.startsWith('price-')) {
    const val = id.replace('price-', '');
    state.activeFilters.price = state.activeFilters.price.filter(x => x !== val);
    const cb = document.querySelector(`#options-price input[value="${val}"]`);
    if (cb) cb.checked = false;
  } else if (id.startsWith('status-')) {
    const val = id.replace('status-', '');
    state.activeFilters.status = state.activeFilters.status.filter(x => x !== val);
    const cb = document.querySelector(`#options-status input[value="${val}"]`);
    if (cb) cb.checked = false;
  }
  applyFiltersAndRender();
};

function clearAllFilters() {
  state.searchTerm = '';
  elements.searchInput.value = '';
  state.showMyPicksOnly = false;
  elements.btnMyPicks.classList.remove('active');
  
  state.activeFilters = {
    city: [],
    cuisine: [],
    price: [],
    status: []
  };

  // Uncheck all boxes
  document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(cb => cb.checked = false);

  applyFiltersAndRender();
}

// ==========================================================================
// Rendering Templates (List and Grid)
// ==========================================================================

function renderCurrentView() {
  const container = elements.container;
  const count = state.filteredRestaurants.length;

  if (count === 0) {
    container.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  elements.emptyState.classList.add('hidden');

  if (state.viewMode === 'list') {
    container.className = 'view-list';
    container.innerHTML = state.filteredRestaurants.map(r => renderListItemHTML(r)).join('');
  } else {
    container.className = 'view-grid';
    container.innerHTML = state.filteredRestaurants.map(r => renderGridItemHTML(r)).join('');
  }

  // Bind checkbox events inside cards
  bindCardCheckboxes();
}

function renderListItemHTML(r) {
  const selection = state.myPicks[r.rank];
  const isVisited = selection === 'visited';
  const isWant = selection === 'wantToGo';

  const votesHTML = r.votes ? `<span class="item-votes-badge">${r.votes} votos</span>` : '';
  const priceSymbol = r.price || '$$$';

  return `
    <article class="list-item" id="resto-item-${r.rank}" style="view-transition-name: resto-card-${r.rank}-${r.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
      
      <!-- Left Column: Restaurant Info -->
      <div class="item-info">
        <div class="item-rank-row">
          <span class="item-rank">${r.rank}º</span>
          ${votesHTML}
        </div>
        <h2 class="item-name">${r.name}</h2>
        
        <!-- Attributes -->
        <div class="item-attributes">
          <div class="attr-item">
            <strong>${r.cuisine}</strong>
          </div>
          <div class="attr-dot"></div>
          <div class="attr-item">${priceSymbol}</div>
          <div class="attr-dot"></div>
          <div class="attr-item">${r.neighborhood || r.city}</div>
        </div>

        <p class="item-description">
          ${r.description.length > 350 ? `
            <span class="desc-short">${r.description.substring(0, 350)}...</span>
            <span class="desc-full hidden">${r.description}</span>
            <button class="read-more-btn" onclick="toggleReadMore(${r.rank}, this)">Leia mais</button>
          ` : `
            <span>${r.description}</span>
          `}
        </p>

        <!-- Custom Checkboxes -->
        <div class="item-check-panel">
          <label class="checkbox-control ${isVisited ? 'checked-visited' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-visited" value="visited" ${isVisited ? 'checked' : ''}>
            <span class="checkbox-box">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>Já fui</span>
          </label>

          <label class="checkbox-control ${isWant ? 'checked-want' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-want" value="wantToGo" ${isWant ? 'checked' : ''}>
            <span class="checkbox-box">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>Quero ir</span>
          </label>
        </div>

        <!-- Service & Address -->
        <div class="item-details">
          <div class="details-row">
            <strong>Endereço:</strong>
            <span>${r.service}</span>
          </div>
          ${r.website ? `
          <div class="details-row">
            <strong>Site:</strong>
            <a href="https://${r.website}" target="_blank" rel="noopener noreferrer">${r.website}</a>
          </div>` : ''}
        </div>
      </div>

      <!-- Right Column: Media -->
      <div class="item-media">
        <img loading="lazy" src="${r.imageUrl || 'https://classic.exame.com/wp-content/uploads/2025/04/RESTAURANTES-1.jpg'}" alt="Foto de ${r.name}">
      </div>

    </article>
  `;
}

function renderGridItemHTML(r) {
  const selection = state.myPicks[r.rank];
  const isVisited = selection === 'visited';
  const isWant = selection === 'wantToGo';
  const priceSymbol = r.price || '$$$';

  return `
    <div class="grid-card" id="grid-card-${r.rank}" onclick="openDetailModal(${r.rank})" style="view-transition-name: resto-card-${r.rank}-${r.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
      <div class="grid-card-media">
        <span class="grid-rank-badge">${r.rank}º</span>
        <img loading="lazy" src="${r.imageUrl || 'https://classic.exame.com/wp-content/uploads/2025/04/RESTAURANTES-1.jpg'}" alt="Foto de ${r.name}">
      </div>
      <div class="grid-card-content">
        <h3 class="grid-card-name">${r.name}</h3>
        <div class="grid-card-meta">
          <span>${r.cuisine}</span>
          <span>•</span>
          <span>${priceSymbol}</span>
          <span>•</span>
          <span>${r.neighborhood || r.city}</span>
        </div>
        <p class="grid-card-desc">${r.description}</p>
        
        <!-- Checklist toggles inside card -->
        <div class="grid-card-checks" onclick="event.stopPropagation()">
          <label class="checkbox-control ${isVisited ? 'checked-visited' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-visited" value="visited" ${isVisited ? 'checked' : ''}>
            <span class="checkbox-box">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>Fui</span>
          </label>

          <label class="checkbox-control ${isWant ? 'checked-want' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-want" value="wantToGo" ${isWant ? 'checked' : ''}>
            <span class="checkbox-box">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>Quero</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// Modal Detail View (Programmatic Popups for Grid Items)
// ==========================================================================

window.openDetailModal = function(rank) {
  const r = state.restaurants.find(x => x.rank === rank);
  if (!r) return;

  const selection = state.myPicks[r.rank];
  const isVisited = selection === 'visited';
  const isWant = selection === 'wantToGo';
  const priceSymbol = r.price || '$$$';

  const votesHTML = r.votes ? `<span class="item-votes-badge">${r.votes} votos</span>` : '';

  elements.detailDialog.innerHTML = `
    <div class="dialog-content">
      <div class="dialog-header">
        <img src="${r.imageUrl || 'https://classic.exame.com/wp-content/uploads/2025/04/RESTAURANTES-1.jpg'}" alt="Foto de ${r.name}">
        <button class="dialog-close-btn" onclick="closeDetailModal()" aria-label="Fechar modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="dialog-body">
        <div class="dialog-rank-name">
          <span class="dialog-rank">${r.rank}º</span>
          <h2 class="dialog-name" id="detail-heading" tabindex="-1">${r.name}</h2>
          ${votesHTML}
        </div>
        
        <div class="dialog-meta">
          <span><strong>${r.cuisine}</strong></span>
          <span>•</span>
          <span>${priceSymbol}</span>
          <span>•</span>
          <span>${r.neighborhood || r.city}</span>
        </div>

        <p class="dialog-desc">${r.description}</p>

        <!-- Dynamic controls inside Modal -->
        <div class="item-check-panel" style="margin-bottom: 24px;">
          <label class="checkbox-control ${isVisited ? 'checked-visited' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-visited-modal" value="visited" ${isVisited ? 'checked' : ''}>
            <span class="checkbox-box">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>Já fui</span>
          </label>

          <label class="checkbox-control ${isWant ? 'checked-want' : ''}" data-rank="${r.rank}">
            <input type="checkbox" class="cb-want-modal" value="wantToGo" ${isWant ? 'checked' : ''}>
            <span class="checkbox-box">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span>Quero ir</span>
          </label>
        </div>

        <div class="dialog-info-box">
          <div>
            <span class="info-title">Endereço & Funcionamento</span>
            <div>${r.service}</div>
          </div>
          ${r.website ? `
          <div style="margin-top: 10px;">
            <span class="info-title">Site Oficial</span>
            <div><a href="https://${r.website}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: none;">${r.website}</a></div>
          </div>` : ''}
        </div>
      </div>
    </div>
  `;

  elements.detailDialog.showModal();
  
  // Accessibility Focus Routing
  document.getElementById('detail-heading').focus();

  // Bind checkbox events inside the modal
  bindModalCheckboxes(r.rank);
};

window.closeDetailModal = function() {
  elements.detailDialog.close();
};

window.toggleReadMore = function(rank, btn) {
  const parent = btn.closest('.item-description');
  const shortEl = parent.querySelector('.desc-short');
  const fullEl = parent.querySelector('.desc-full');
  const isCollapsed = fullEl.classList.contains('hidden');
  
  if (isCollapsed) {
    shortEl.classList.add('hidden');
    fullEl.classList.remove('hidden');
    btn.textContent = 'Leia menos';
  } else {
    shortEl.classList.remove('hidden');
    fullEl.classList.add('hidden');
    btn.textContent = 'Leia mais';
  }
};

// ==========================================================================
// Drawer - My Picks List Manager
// ==========================================================================

function toggleDrawer() {
  const isOpen = elements.picksDrawer.classList.contains('open');
  if (isOpen) {
    elements.picksDrawer.classList.remove('open');
    elements.picksDrawer.setAttribute('aria-hidden', 'true');
  } else {
    renderPicksDrawerList();
    elements.picksDrawer.classList.add('open');
    elements.picksDrawer.setAttribute('aria-hidden', 'false');
  }
}

function renderPicksDrawerList() {
  const picksList = elements.drawerPicksList;
  const entries = Object.entries(state.myPicks);
  
  let visitedCount = 0;
  let wantCount = 0;

  if (entries.length === 0) {
    picksList.innerHTML = `<p style="text-align: center; color: var(--text-tertiary); font-size: 13px; margin: 24px 0;">Nenhuma escolha marcada ainda. Navegue e adicione favoritos!</p>`;
    elements.statVisited.textContent = '0';
    elements.statWantToGo.textContent = '0';
    return;
  }

  // Compile entries into structured lists
  const compiled = entries.map(([rankStr, type]) => {
    const rank = parseInt(rankStr);
    const r = state.restaurants.find(x => x.rank === rank);
    if (type === 'visited') visitedCount++;
    if (type === 'wantToGo') wantCount++;
    return { rank, type, name: r ? r.name : 'Restaurante Desconhecido' };
  });

  // Sort by rank
  compiled.sort((a, b) => a.rank - b.rank);

  elements.statVisited.textContent = visitedCount;
  elements.statWantToGo.textContent = wantCount;

  picksList.innerHTML = compiled.map(item => `
    <div class="drawer-pick-item">
      <div class="pick-meta">
        <span class="pick-rank">${item.rank}º</span>
        <span class="pick-name">${item.name}</span>
      </div>
      <span class="pick-badge-type ${item.type === 'visited' ? 'pick-badge-visited' : 'pick-badge-want'}">
        ${item.type === 'visited' ? 'Fui' : 'Quero ir'}
      </span>
    </div>
  `).join('');
}

function copyPicksToClipboard() {
  const entries = Object.entries(state.myPicks);
  if (entries.length === 0) {
    showToast('Adicione alguns restaurantes à sua lista antes de exportar.');
    return;
  }

  const visitedList = [];
  const wantList = [];

  entries.forEach(([rankStr, type]) => {
    const rank = parseInt(rankStr);
    const r = state.restaurants.find(x => x.rank === rank);
    const name = r ? r.name : `Restaurante ${rank}`;
    const city = r ? `(${r.city})` : '';
    if (type === 'visited') {
      visitedList.push(`- ${rank}º ${name} ${city}`);
    } else {
      wantList.push(`- ${rank}º ${name} ${city}`);
    }
  });

  let text = `📋 MEU GUIA DE RESTAURANTES PERSONALIZADO (100 Melhores do Brasil)\n\n`;
  if (visitedList.length > 0) {
    text += `✅ JÁ FUI E RECOMENDO:\n${visitedList.join('\n')}\n\n`;
  }
  if (wantList.length > 0) {
    text += `📌 QUERO VISITAR EM BREVE:\n${wantList.join('\n')}\n\n`;
  }
  text += `Acesse e monte o seu em: ${window.location.origin + window.location.pathname}`;

  navigator.clipboard.writeText(text)
    .then(() => {
      showToast('Copiado para a área de transferência! Envie pelo WhatsApp.');
    })
    .catch(() => {
      showToast('Falha ao copiar lista.');
    });
}

function copyShareLink() {
  const url = generateShareUrl();
  navigator.clipboard.writeText(url)
    .then(() => {
      showToast('Link de compartilhamento copiado! Quem abrir verá as suas escolhas.');
    })
    .catch(() => {
      showToast('Falha ao copiar link.');
    });
}

// ==========================================================================
// Event Bindings & Listeners
// ==========================================================================

function bindEventListeners() {
  // View Toggle list/grid
  elements.btnViewList.addEventListener('click', () => {
    if (state.viewMode === 'list') return;
    state.viewMode = 'list';
    elements.btnViewList.classList.add('active');
    elements.btnViewGrid.classList.remove('active');
    applyFiltersAndRender();
  });

  elements.btnViewGrid.addEventListener('click', () => {
    if (state.viewMode === 'grid') return;
    state.viewMode = 'grid';
    elements.btnViewGrid.classList.add('active');
    elements.btnViewList.classList.remove('active');
    applyFiltersAndRender();
  });

  // Bookmark "My Picks" Filter
  elements.btnMyPicks.addEventListener('click', () => {
    state.showMyPicksOnly = !state.showMyPicksOnly;
    elements.btnMyPicks.classList.toggle('active', state.showMyPicksOnly);
    applyFiltersAndRender();
  });

  // Search input typing (debounced slightly or responsive)
  elements.searchInput.addEventListener('input', (e) => {
    state.searchTerm = e.target.value;
    applyFiltersAndRender();
  });

  // Header Dropdowns Open/Close
  document.querySelectorAll('.filter-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const filterType = trigger.getAttribute('data-filter');
      const panel = document.getElementById(`panel-${filterType}`);

      // Check if panel is already active
      const isActive = panel.classList.contains('active');

      // Close all panels
      document.querySelectorAll('.filter-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.filter-dropdown-trigger').forEach(t => t.classList.remove('active'));

      if (!isActive) {
        elements.filterPanelsContainer.classList.remove('container-hidden');
        panel.classList.add('active');
        trigger.classList.add('active');
      } else {
        elements.filterPanelsContainer.classList.add('container-hidden');
      }
    });
  });

  // Close filter panel if click outside
  document.addEventListener('click', (e) => {
    if (!elements.filterPanelsContainer.contains(e.target) && !e.target.classList.contains('filter-dropdown-trigger')) {
      elements.filterPanelsContainer.classList.add('container-hidden');
      document.querySelectorAll('.filter-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.filter-dropdown-trigger').forEach(t => t.classList.remove('active'));
    }
  });

  // Panel checkmark selections
  elements.filterPanelsContainer.addEventListener('change', (e) => {
    const target = e.target;
    if (target.type === 'checkbox') {
      const filterType = target.getAttribute('data-filter') || target.closest('.filter-panel').getAttribute('data-filter');
      const val = target.value;

      if (target.checked) {
        if (!state.activeFilters[filterType].includes(val)) {
          state.activeFilters[filterType].push(val);
        }
      } else {
        state.activeFilters[filterType] = state.activeFilters[filterType].filter(x => x !== val);
      }

      applyFiltersAndRender();
    }
  });

  // Panel "Select All / Reset" triggers
  document.querySelectorAll('.select-all-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.getAttribute('data-target');
      state.activeFilters[type] = [];
      document.querySelectorAll(`#panel-${type} input[type="checkbox"]`).forEach(cb => cb.checked = false);
      applyFiltersAndRender();
    });
  });

  // Reset filter buttons
  elements.btnClearFilters.addEventListener('click', clearAllFilters);
  elements.btnResetFiltersEmpty.addEventListener('click', clearAllFilters);

  // Drawer Toggles
  elements.btnMyPicks.addEventListener('dblclick', toggleDrawer); // double click opens list details
  elements.btnMyPicks.addEventListener('click', (e) => {
    // If they click on badge or text when already active, open list
    if (state.showMyPicksOnly) {
      toggleDrawer();
    }
  });
  elements.btnCloseDrawer.addEventListener('click', toggleDrawer);
  elements.drawerBackdrop.addEventListener('click', toggleDrawer);
  elements.btnCopyPicks.addEventListener('click', copyPicksToClipboard);
  elements.btnShareLink.addEventListener('click', copyShareLink);

  // Keyboard support: Escape closes Dialog and Drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.picksDrawer.classList.contains('open')) {
        toggleDrawer();
      }
    }
  });
}

function bindCardCheckboxes() {
  document.querySelectorAll('.checkbox-control').forEach(control => {
    control.addEventListener('click', (e) => {
      // Prevent clicking the checkbox from triggering opening modal
      e.stopPropagation();
    });

    const cbVisited = control.querySelector('.cb-visited');
    const cbWant = control.querySelector('.cb-want');
    const rank = parseInt(control.getAttribute('data-rank'));

    if (cbVisited) {
      cbVisited.addEventListener('change', () => {
        handleCheckChange(rank, 'visited', cbVisited.checked);
      });
    }

    if (cbWant) {
      cbWant.addEventListener('change', () => {
        handleCheckChange(rank, 'wantToGo', cbWant.checked);
      });
    }
  });
}

function bindModalCheckboxes(rank) {
  const dialog = elements.detailDialog;
  const cbVisited = dialog.querySelector('.cb-visited-modal');
  const cbWant = dialog.querySelector('.cb-want-modal');

  if (cbVisited) {
    cbVisited.addEventListener('change', () => {
      handleCheckChange(rank, 'visited', cbVisited.checked);
      // Re-apply style to modal control
      cbVisited.closest('.checkbox-control').classList.toggle('checked-visited', cbVisited.checked);
      const cbWantModal = dialog.querySelector('.cb-want-modal');
      if (cbVisited.checked && cbWantModal && cbWantModal.checked) {
        cbWantModal.checked = false;
        cbWantModal.closest('.checkbox-control').classList.remove('checked-want');
      }
    });
  }

  if (cbWant) {
    cbWant.addEventListener('change', () => {
      handleCheckChange(rank, 'wantToGo', cbWant.checked);
      // Re-apply style to modal control
      cbWant.closest('.checkbox-control').classList.toggle('checked-want', cbWant.checked);
      const cbVisitedModal = dialog.querySelector('.cb-visited-modal');
      if (cbWant.checked && cbVisitedModal && cbVisitedModal.checked) {
        cbVisitedModal.checked = false;
        cbVisitedModal.closest('.checkbox-control').classList.remove('checked-visited');
      }
    });
  }
}

function handleCheckChange(rank, type, isChecked) {
  const currentSelection = state.myPicks[rank];

  if (isChecked) {
    state.myPicks[rank] = type;
    
    // De-select the other choice since you can't have both "Já Fui" and "Quero Ir" active
    const cardEl = document.getElementById(`resto-item-${rank}`) || document.getElementById(`grid-card-${rank}`);
    if (cardEl) {
      if (type === 'visited') {
        const wantInput = cardEl.querySelector('.cb-want');
        if (wantInput) {
          wantInput.checked = false;
          wantInput.closest('.checkbox-control').classList.remove('checked-want');
        }
      } else {
        const visitedInput = cardEl.querySelector('.cb-visited');
        if (visitedInput) {
          visitedInput.checked = false;
          visitedInput.closest('.checkbox-control').classList.remove('checked-visited');
        }
      }
    }
  } else {
    // If it was checked and now unticked, delete the pick
    if (currentSelection === type) {
      delete state.myPicks[rank];
    }
  }

  // Update card stylesheet active class
  const cardEl = document.getElementById(`resto-item-${rank}`) || document.getElementById(`grid-card-${rank}`);
  if (cardEl) {
    const visitedControl = cardEl.querySelector('.cb-visited')?.closest('.checkbox-control');
    const wantControl = cardEl.querySelector('.cb-want')?.closest('.checkbox-control');
    
    if (visitedControl) visitedControl.classList.toggle('checked-visited', state.myPicks[rank] === 'visited');
    if (wantControl) wantControl.classList.toggle('checked-want', state.myPicks[rank] === 'wantToGo');
  }

  savePicksToStorage();
  
  // Re-render picks list if drawer is open
  if (elements.picksDrawer.classList.contains('open')) {
    renderPicksDrawerList();
  }
}

function updateBadge() {
  const count = Object.keys(state.myPicks).length;
  elements.picksBadge.textContent = count;
  elements.picksBadge.style.display = count > 0 ? 'flex' : 'none';
}

// ==========================================================================
// Toast notification system
// ==========================================================================

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');
  
  // Force a redraw
  void elements.toast.offsetWidth;
  
  elements.toast.classList.add('show');

  setTimeout(() => {
    elements.toast.classList.remove('show');
    setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 300);
  }, 3500);
}

// Initialize Application on DOM Content Loaded
document.addEventListener('DOMContentLoaded', init);
