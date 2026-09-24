// Vanilla JavaScript for Wisdom Vault Quotes Application
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Spotlight
  const spotlightCard = document.getElementById('spotlightCard');
  const spotlightText = document.getElementById('spotlightText');
  const spotlightAuthor = document.getElementById('spotlightAuthor');
  const spotlightCategory = document.getElementById('spotlightCategory');
  const btnNewRandom = document.getElementById('btnNewRandom');
  const btnCopySpotlight = document.getElementById('btnCopySpotlight');
  const btnRandomFromFilter = document.getElementById('btnRandomFromFilter');

  // DOM Elements - Filters & Search
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categorySelect = document.getElementById('categorySelect');
  const authorSelect = document.getElementById('authorSelect');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const btnEmptyReset = document.getElementById('btnEmptyReset');
  const quickChipsContainer = document.getElementById('quickChipsContainer');

  // DOM Elements - Results Grid & Toast
  const resultsCount = document.getElementById('resultsCount');
  const quotesGrid = document.getElementById('quotesGrid');
  const emptyState = document.getElementById('emptyState');
  const toast = document.getElementById('toast');
  const collectionSize = document.getElementById('collectionSize');

  // App State
  let currentQuotes = [];
  let currentSpotlightQuote = null;
  let debounceTimer = null;
  let toastTimer = null;

  // ----------------------------------------------------
  // Toast Notification
  // ----------------------------------------------------
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // ----------------------------------------------------
  // Clipboard Helper
  // ----------------------------------------------------
  function copyQuoteToClipboard(text, author) {
    const fullText = `"${text}" — ${author}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(fullText).then(() => {
        showToast('Quote copied to clipboard!');
      }).catch(() => {
        fallbackCopyTextToClipboard(fullText);
      });
    } else {
      fallbackCopyTextToClipboard(fullText);
    }
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Quote copied to clipboard!');
    } catch (err) {
      showToast('Unable to copy quote');
    }
    document.body.removeChild(textArea);
  }

  // ----------------------------------------------------
  // Highlight Search Terms
  // ----------------------------------------------------
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightMatches(text, term) {
    if (!term || term.trim() === '') return text;
    const cleanTerm = escapeRegExp(term.trim());
    const regex = new RegExp(`(${cleanTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // ----------------------------------------------------
  // Spotlight / Random Quote
  // ----------------------------------------------------
  async function fetchRandomQuote(category = '', author = '') {
    spotlightText.style.opacity = '0.3';
    spotlightAuthor.style.opacity = '0.3';

    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (author) params.append('author', author);

      const url = `/api/quotes/random?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('No quote found matching selection');
      }

      const quote = await res.json();
      currentSpotlightQuote = quote;

      setTimeout(() => {
        spotlightText.textContent = quote.quote;
        spotlightAuthor.textContent = quote.author;
        spotlightCategory.textContent = quote.category;
        spotlightText.style.opacity = '1';
        spotlightAuthor.style.opacity = '1';
      }, 150);
    } catch (err) {
      spotlightText.textContent = 'Could not load a random quote for this filter.';
      spotlightAuthor.textContent = '';
      spotlightCategory.textContent = 'Notice';
      spotlightText.style.opacity = '1';
      spotlightAuthor.style.opacity = '1';
    }
  }

  // ----------------------------------------------------
  // Populate Categories and Authors in Filters
  // ----------------------------------------------------
  async function loadMetadata() {
    try {
      const [catRes, authRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/authors')
      ]);

      const categories = await catRes.json();
      const authors = await authRes.json();

      // Populate Category Select
      categorySelect.innerHTML = '<option value="all">All Categories</option>';
      quickChipsContainer.innerHTML = '';

      // All chip
      const allChip = document.createElement('button');
      allChip.className = 'chip-btn active';
      allChip.textContent = 'All';
      allChip.dataset.category = 'all';
      allChip.addEventListener('click', () => {
        categorySelect.value = 'all';
        updateQuickChipsState('all');
        performSearch();
      });
      quickChipsContainer.appendChild(allChip);

      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = `${cat.name} (${cat.count})`;
        categorySelect.appendChild(option);

        // Quick Chip
        const chip = document.createElement('button');
        chip.className = 'chip-btn';
        chip.textContent = `${cat.name}`;
        chip.dataset.category = cat.name;
        chip.addEventListener('click', () => {
          categorySelect.value = cat.name;
          updateQuickChipsState(cat.name);
          performSearch();
        });
        quickChipsContainer.appendChild(chip);
      });

      // Populate Author Select
      authorSelect.innerHTML = '<option value="">All Authors</option>';
      authors.forEach(author => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        authorSelect.appendChild(option);
      });
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  }

  function updateQuickChipsState(selectedCategory) {
    const chips = quickChipsContainer.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
      if (chip.dataset.category.toLowerCase() === selectedCategory.toLowerCase()) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // ----------------------------------------------------
  // Render Quotes Grid
  // ----------------------------------------------------
  function renderQuotes(quotes, searchTerm = '') {
    quotesGrid.innerHTML = '';
    currentQuotes = quotes;

    if (quotes.length === 0) {
      emptyState.classList.remove('hidden');
      resultsCount.textContent = '0 quotes found';
      return;
    }

    emptyState.classList.add('hidden');
    resultsCount.textContent = `Showing ${quotes.length} of 100 quotes`;

    const fragment = document.createDocumentFragment();

    quotes.forEach(item => {
      const card = document.createElement('article');
      card.className = 'quote-card';

      const highlightedText = highlightMatches(item.quote, searchTerm);
      const highlightedAuthor = highlightMatches(item.author, searchTerm);

      card.innerHTML = `
        <p class="card-quote-text">${highlightedText}</p>
        <div class="card-footer">
          <div class="card-author-info">
            <span class="card-author">— ${highlightedAuthor}</span>
            <span class="card-category">${item.category}</span>
          </div>
          <div class="card-actions">
            <button class="card-btn" title="Copy quote" data-id="${item.id}" aria-label="Copy quote">
              📋
            </button>
            <button class="card-btn" title="Set to Spotlight" data-spotlight="${item.id}" aria-label="Spotlight quote">
              ⭐
            </button>
          </div>
        </div>
      `;

      // Copy button
      const copyBtn = card.querySelector(`[data-id="${item.id}"]`);
      copyBtn.addEventListener('click', () => {
        copyQuoteToClipboard(item.quote, item.author);
      });

      // Spotlight button
      const spotlightBtn = card.querySelector(`[data-spotlight="${item.id}"]`);
      spotlightBtn.addEventListener('click', () => {
        currentSpotlightQuote = item;
        spotlightText.textContent = item.quote;
        spotlightAuthor.textContent = item.author;
        spotlightCategory.textContent = item.category;
        spotlightCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Set to Spotlight!');
      });

      fragment.appendChild(card);
    });

    quotesGrid.appendChild(fragment);
  }

  // ----------------------------------------------------
  // Search & Filter Execution
  // ----------------------------------------------------
  async function performSearch() {
    const query = searchInput.value.trim();
    const category = categorySelect.value;
    const authorDropdown = authorSelect.value;

    // Toggle clear search button visibility
    clearSearchBtn.style.display = query.length > 0 ? 'block' : 'none';

    // Construct query parameters
    const params = new URLSearchParams();
    if (query) {
      params.append('q', query);
    }
    if (authorDropdown) {
      params.append('author', authorDropdown);
    }
    if (category && category !== 'all') {
      params.append('category', category);
    }

    try {
      const response = await fetch(`/api/quotes/search?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      renderQuotes(data.quotes, query);
    } catch (err) {
      console.error('Error fetching filtered quotes:', err);
    }
  }

  function debouncedSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performSearch, 220);
  }

  function resetAllFilters() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    categorySelect.value = 'all';
    authorSelect.value = '';
    updateQuickChipsState('all');
    performSearch();
  }

  // ----------------------------------------------------
  // Event Listeners
  // ----------------------------------------------------
  // New Random Quote
  btnNewRandom.addEventListener('click', () => {
    fetchRandomQuote();
  });

  // Copy Spotlight Quote
  btnCopySpotlight.addEventListener('click', () => {
    if (currentSpotlightQuote) {
      copyQuoteToClipboard(currentSpotlightQuote.quote, currentSpotlightQuote.author);
    }
  });

  // Random from Current Filter
  btnRandomFromFilter.addEventListener('click', () => {
    if (currentQuotes.length > 0) {
      const randomIdx = Math.floor(Math.random() * currentQuotes.length);
      const picked = currentQuotes[randomIdx];
      currentSpotlightQuote = picked;
      spotlightText.textContent = picked.quote;
      spotlightAuthor.textContent = picked.author;
      spotlightCategory.textContent = picked.category;
      spotlightCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Random quote picked from filtered results!');
    } else {
      showToast('No quotes match current filter to pick from.');
    }
  });

  // Search input typing
  searchInput.addEventListener('input', debouncedSearch);

  // Clear search input
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    performSearch();
  });

  // Category change
  categorySelect.addEventListener('change', (e) => {
    updateQuickChipsState(e.target.value);
    performSearch();
  });

  // Author dropdown change
  authorSelect.addEventListener('change', () => {
    performSearch();
  });

  // Reset buttons
  btnResetFilters.addEventListener('click', resetAllFilters);
  btnEmptyReset.addEventListener('click', resetAllFilters);

  // ----------------------------------------------------
  // App Initialization
  // ----------------------------------------------------
  async function init() {
    await loadMetadata();
    await fetchRandomQuote();
    await performSearch();
  }

  init();
});
