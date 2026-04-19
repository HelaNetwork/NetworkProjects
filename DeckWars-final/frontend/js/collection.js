/**
 * collection.js — DeckWars Card Collection page logic
 */

let selectedTemplateId = null;
let allCards = [];     // { tokenId, stats }
let currentFilter = 'all';
let cardClickMode = 'detail'; // 'detail' or 'select'

async function onWalletConnected() {
  document.getElementById('mint-section').style.display = 'block';
  document.getElementById('collection-section').style.display = 'block';
  await loadTemplates();
  await loadMyCards();
}

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

async function loadTemplates() {
  if (!DW.cardContract) return;
  const grid = document.getElementById('template-grid');
  grid.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Loading templates...</span>';

  try {
    const count = Number(await DW.cardContract.templateCount());
    grid.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const t = await DW.cardContract.templates(i);
      const cls = CLASS_NAMES[Number(t.cardClass)] || 'Warrior';
      const icon = CLASS_ICONS[cls] || '⚔️';
      const color = CLASS_COLORS[cls] || 'var(--cyan)';
      const rarity = Number(t.rarity);

      const card = document.createElement('div');
      card.className = `nft-card rarity-${rarity}`;
      card.style.cursor = 'pointer';
      card.dataset.templateId = i;
      card.innerHTML = `
        <div class="card-header" style="height:100px;">
          <div class="card-class-bg" style="background:radial-gradient(circle,${color},transparent 70%); opacity:0.2;"></div>
          <span class="card-icon" style="color:${color}; font-size:2.5rem;">${icon}</span>
          <div class="card-rarity-bar"></div>
        </div>
        <div class="card-body" style="padding:10px 12px;">
          <div class="card-name" style="font-size:0.78rem;">${t.name}</div>
          <div class="card-class-label class-${cls}" style="font-size:0.65rem;">${cls}</div>
          <div class="card-stats" style="margin-top:6px;">
            <div class="stat-item"><span class="stat-icon">❤️</span><span class="stat-value">${t.hp}</span></div>
            <div class="stat-item"><span class="stat-icon">⚔️</span><span class="stat-value">${t.attack}</span></div>
            <div class="stat-item"><span class="stat-icon">🛡️</span><span class="stat-value">${t.defense}</span></div>
            <div class="stat-item"><span class="stat-icon">⚡</span><span class="stat-value">${t.speed}</span></div>
          </div>
        </div>`;

      card.addEventListener('click', () => selectTemplate(i, card));
      grid.appendChild(card);
    }
  } catch (err) {
    grid.innerHTML = `<span style="color:var(--red);">Error loading templates: ${err.message}</span>`;
  }
}

function selectTemplate(id, el) {
  document.querySelectorAll('#template-grid .nft-card').forEach(c => {
    c.style.borderColor = '';
    c.style.boxShadow = '';
  });
  el.style.borderColor = 'var(--cyan)';
  el.style.boxShadow = 'var(--shadow-cyan)';
  selectedTemplateId = id;
  document.getElementById('mint-btn').disabled = false;
  document.getElementById('mint-status').textContent = `Selected: Template #${id + 1}`;
}

async function mintSelectedCard() {
  if (selectedTemplateId === null) { toast('Select a card template first!', 'warning'); return; }
  setBtn('mint-btn', '<span class="spinner"></span> Minting...', true);
  document.getElementById('mint-status').textContent = 'Confirm the transaction in MetaMask...';

  try {
    const tx = await DW.cardContract.mintCard(selectedTemplateId);
    document.getElementById('mint-status').textContent = 'Transaction sent, waiting for confirmation...';
    const receipt = await tx.wait();

    // Find the CardMinted event
    const event = receipt.logs.find(l => {
      try { return DW.cardContract.interface.parseLog(l)?.name === 'CardMinted'; } catch { return false; }
    });

    toast('Card minted successfully! 🎉', 'success');
    setBtn('mint-btn', '✨ Mint Selected Card', false);
    document.getElementById('mint-status').textContent = '';
    await loadMyCards();
  } catch (err) {
    toast('Mint failed: ' + (err.reason || err.message || 'Unknown error'), 'error');
    setBtn('mint-btn', '✨ Mint Selected Card', false);
    document.getElementById('mint-status').textContent = '';
  }
}

// ─── MY CARDS ────────────────────────────────────────────────────────────────

async function loadMyCards() {
  if (!DW.cardContract || !DW.userAddress) return;
  const grid = document.getElementById('cards-grid');
  const noCards = document.getElementById('no-cards');
  grid.innerHTML = '<span style="color:var(--text-muted);">Loading your cards...</span>';

  try {
    const tokenIds = await DW.cardContract.getOwnedCards(DW.userAddress);
    allCards = [];

    for (const tokenId of tokenIds) {
      const stats = await DW.cardContract.getCardStats(tokenId);
      allCards.push({ tokenId: Number(tokenId), stats });
    }

    document.getElementById('card-count-badge').textContent = `${allCards.length} Cards Owned`;
    renderCards();
  } catch (err) {
    grid.innerHTML = `<span style="color:var(--red);">Error: ${err.message}</span>`;
  }
}

function renderCards() {
  const grid = document.getElementById('cards-grid');
  const noCards = document.getElementById('no-cards');
  const filtered = currentFilter === 'all'
    ? allCards
    : allCards.filter(c => CLASS_NAMES[Number(c.stats.cardClass)] === currentFilter);

  grid.innerHTML = '';
  if (filtered.length === 0) {
    noCards.style.display = 'block';
  } else {
    noCards.style.display = 'none';
    filtered.forEach(({ tokenId, stats }) => {
      grid.innerHTML += buildCardHTML(tokenId, stats);
    });
  }
}

function filterClass(cls) {
  currentFilter = cls;
  document.querySelectorAll('#filter-bar button').forEach(b => {
    b.style.borderColor = '';
    b.style.color = '';
  });
  const active = document.querySelector(`[data-filter="${cls}"]`);
  if (active) { active.style.borderColor = 'var(--cyan)'; active.style.color = 'var(--cyan)'; }
  renderCards();
}

// ─── CARD DETAIL MODAL ───────────────────────────────────────────────────────

async function handleCardClick(tokenId) {
  const entry = allCards.find(c => c.tokenId === tokenId);
  if (!entry) return;
  await openCardModal(tokenId, entry.stats);
}

async function openCardModal(tokenId, stats) {
  const cls = CLASS_NAMES[Number(stats.cardClass)] || 'Warrior';
  const icon = CLASS_ICONS[cls] || '⚔️';
  const color = CLASS_COLORS[cls] || 'var(--cyan)';
  const rarity = Number(stats.rarity);

  document.getElementById('modal-icon').textContent = icon;
  document.getElementById('modal-icon').style.color = color;
  document.getElementById('modal-name').textContent = `#${tokenId} ${stats.name}`;

  const badges = document.getElementById('modal-badges');
  badges.innerHTML = `
    <span class="badge badge-cyan">${cls}</span>
    <span class="badge badge-${rarity >= 3 ? 'purple' : rarity === 4 ? 'gold' : 'cyan'}">${RARITY_LABELS[rarity]}</span>`;

  const hp = Number(stats.hp), maxHp = Number(stats.maxHp);
  document.getElementById('modal-hp-text').textContent = `${hp}/${maxHp}`;
  document.getElementById('modal-hp-bar').style.width = `${Math.round(hp/maxHp*100)}%`;
  document.getElementById('modal-atk-text').textContent = stats.attack;
  document.getElementById('modal-atk-bar').style.width = `${Math.min(Number(stats.attack)/150*100,100)}%`;
  document.getElementById('modal-def-text').textContent = stats.defense;
  document.getElementById('modal-def-bar').style.width = `${Math.min(Number(stats.defense)/120*100,100)}%`;
  document.getElementById('modal-spd-text').textContent = stats.speed;
  document.getElementById('modal-spd-bar').style.width = `${Math.min(Number(stats.speed)/120*100,100)}%`;

  // Load move info
  const movesEl = document.getElementById('modal-moves');
  movesEl.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem;">Loading moves...</span>';
  const moveInfos = await Promise.all(stats.moves.map(addr => getMoveInfo(addr)));
  movesEl.innerHTML = moveInfos.map(m => `
    <div class="move-btn" style="cursor:default;">
      <div class="move-name">${m.name}</div>
      <div class="move-desc">${m.description}</div>
      <div class="move-power-bar"><div class="move-power-fill" style="width:${m.power}%;"></div></div>
    </div>`).join('');

  document.getElementById('card-modal').classList.add('open');
}

function closeCardModal() {
  document.getElementById('card-modal').classList.remove('open');
}

// Close modal on overlay click
document.getElementById('card-modal').addEventListener('click', function(e) {
  if (e.target === this) closeCardModal();
});
