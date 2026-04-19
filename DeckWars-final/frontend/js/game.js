/**
 * game.js — DeckWars Battle Arena page logic
 * Implements the commit-reveal turn flow for provably fair battles
 */

// ─── STATE ───────────────────────────────────────────────────────────────────

const GameStatus = { Open: 0n, Active: 1n, Finished: 2n, Expired: 3n };
const CommitStatus = { None: 0, Committed: 1, Revealed: 2 };

let battleState = {
  gameId: null,
  game: null,
  amPlayer1: false,
  myCards: [],
  oppCards: [],
  selectedMoveIndex: null,
  mySecret: null,
  eventListeners: [],
  pollInterval: null,
};

let myOwnedCards = [];         // for card picker
let selectedPickerCards = [];  // up to 3 selected
let acceptPickerCards  = [];

// ─── ON WALLET CONNECT ───────────────────────────────────────────────────────

async function onWalletConnected() {
  document.getElementById('battle-lobby').style.display = 'block';
  await loadCardPickers();
}

async function loadCardPickers() {
  if (!DW.cardContract || !DW.userAddress) return;
  try {
    const tokenIds = await DW.cardContract.getOwnedCards(DW.userAddress);
    myOwnedCards = [];
    for (const id of tokenIds) {
      const stats = await DW.cardContract.getCardStats(id);
      myOwnedCards.push({ tokenId: Number(id), stats });
    }
    renderCardPicker('my-card-picker', selectedPickerCards, 'challenge');
    renderCardPicker('accept-card-picker', acceptPickerCards, 'accept');
  } catch (err) {
    console.error('Error loading cards for picker:', err);
  }
}

function renderCardPicker(containerId, selectedArr, mode) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (myOwnedCards.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; color:var(--text-muted); font-size:0.8rem; text-align:center; padding:12px;">
      No cards yet — <a href="collection.html" style="color:var(--cyan);">mint some first!</a></div>`;
    return;
  }
  myOwnedCards.forEach(({ tokenId, stats }) => {
    const cls = CLASS_NAMES[Number(stats.cardClass)] || 'Warrior';
    const icon = CLASS_ICONS[cls] || '⚔️';
    const color = CLASS_COLORS[cls] || 'var(--cyan)';
    const isSelected = selectedArr.includes(tokenId);
    const el = document.createElement('div');
    el.style.cssText = `padding:8px; border-radius:8px; border:1px solid ${isSelected ? 'var(--cyan)' : 'var(--border-dim)'}; 
      background:${isSelected ? 'rgba(0,212,255,0.1)' : 'var(--bg-deep)'}; cursor:pointer; text-align:center; transition:all 0.2s;`;
    el.innerHTML = `<div style="font-size:1.6rem;color:${color};">${icon}</div>
      <div style="font-size:0.65rem; font-family:var(--font-hud); color:var(--text-secondary); margin-top:2px;">#${tokenId}</div>
      <div style="font-size:0.6rem; color:var(--text-muted);">${stats.name.split(' ')[0]}</div>`;
    el.addEventListener('click', () => toggleCardPick(tokenId, selectedArr, containerId, mode));
    container.appendChild(el);
  });
}

function toggleCardPick(tokenId, selectedArr, containerId, mode) {
  const idx = selectedArr.indexOf(tokenId);
  if (idx > -1) {
    selectedArr.splice(idx, 1);
  } else {
    if (selectedArr.length >= 3) { toast('Select exactly 3 cards', 'warning'); return; }
    selectedArr.push(tokenId);
  }
  renderCardPicker(containerId, selectedArr, mode);
  updateSelectedDisplay(mode === 'challenge' ? 'selected-cards-display' : 'accept-selected-display', selectedArr);
}

function updateSelectedDisplay(elId, arr) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (arr.length === 0) {
    el.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem; align-self:center;">No cards selected</span>';
  } else {
    el.innerHTML = arr.map(id => {
      const c = myOwnedCards.find(x => x.tokenId === id);
      const cls = c ? CLASS_NAMES[Number(c.stats.cardClass)] : 'Warrior';
      return `<span class="badge badge-cyan">${CLASS_ICONS[cls]} #${id}</span>`;
    }).join('');
  }
}

// ─── CHALLENGE FLOW ──────────────────────────────────────────────────────────

async function issueChallenge() {
  const opponent = document.getElementById('opponent-address').value.trim();
  const wagerEth = parseFloat(document.getElementById('wager-amount').value) || 0;

  if (!ethers.isAddress(opponent)) { toast('Invalid opponent address', 'error'); return; }
  if (selectedPickerCards.length !== 3) { toast('Select exactly 3 cards', 'warning'); return; }

  setBtn('challenge-btn', '<span class="spinner"></span> Sending...', true);
  try {
    const wagerWei = ethers.parseEther(wagerEth.toString());
    const tx = await DW.gameContract.openChallenge(
      opponent,
      selectedPickerCards,
      { value: wagerWei }
    );
    toast('Challenge sent! Waiting for confirmation...', 'info');
    const receipt = await tx.wait();

    // Extract gameId from event
    let gameId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = DW.gameContract.interface.parseLog(log);
        if (parsed?.name === 'ChallengeOpened') {
          gameId = Number(parsed.args.gameId);
        }
      } catch {}
    }

    toast(`Challenge opened! Game ID: ${gameId}`, 'success');
    setBtn('challenge-btn', '⚔️ Issue Challenge', false);
    if (gameId) await enterBattle(gameId);
  } catch (err) {
    toast('Challenge failed: ' + (err.reason || err.message), 'error');
    setBtn('challenge-btn', '⚔️ Issue Challenge', false);
  }
}

async function acceptChallenge() {
  const gameId = parseInt(document.getElementById('accept-game-id').value);
  if (!gameId) { toast('Enter a valid game ID', 'warning'); return; }
  if (acceptPickerCards.length !== 3) { toast('Select exactly 3 cards', 'warning'); return; }

  setBtn('accept-btn', '<span class="spinner"></span> Accepting...', true);
  try {
    const game = await DW.gameContract.getGame(gameId);
    const wager = BigInt(game.wager);
    const tx = await DW.gameContract.acceptChallenge(gameId, acceptPickerCards, { value: wager });
    toast('Acceptance sent...', 'info');
    await tx.wait();
    toast('Challenge accepted! Battle begins!', 'success');
    setBtn('accept-btn', '🛡️ Accept Challenge', false);
    await enterBattle(gameId);
  } catch (err) {
    toast('Accept failed: ' + (err.reason || err.message), 'error');
    setBtn('accept-btn', '🛡️ Accept Challenge', false);
  }
}

async function loadGame() {
  const gameId = parseInt(document.getElementById('load-game-id').value);
  if (!gameId) { toast('Enter a valid game ID', 'warning'); return; }
  const statusEl = document.getElementById('load-status');
  statusEl.textContent = 'Loading...';
  try {
    const game = await DW.gameContract.getGame(gameId);
    statusEl.textContent = `Found game #${gameId}`;
    await enterBattle(gameId);
  } catch (err) {
    statusEl.textContent = `Error: ${err.reason || err.message}`;
    toast('Game not found', 'error');
  }
}

// ─── BATTLE SCREEN ───────────────────────────────────────────────────────────

async function enterBattle(gameId) {
  battleState.gameId = gameId;
  document.getElementById('battle-lobby').style.display = 'none';
  document.getElementById('battle-screen').style.display = 'block';
  document.getElementById('game-id-badge').style.display = '';
  document.getElementById('game-id-badge').textContent = `Game #${gameId}`;
  addLog(`⚔️ Entered Game #${gameId}`, 'system');
  await refreshBattleState();
  startPolling();
}

async function refreshBattleState() {
  if (!battleState.gameId) return;
  try {
    const game = await DW.gameContract.getGame(battleState.gameId);
    battleState.game = game;
    battleState.amPlayer1 = game.player1.addr.toLowerCase() === DW.userAddress.toLowerCase();

    // Check game status
    if (Number(game.status) === 2) { // Finished
      showGameOver(game);
      return;
    }
    if (Number(game.status) === 0) { // Open — waiting for opponent
      document.getElementById('turn-badge').textContent = 'WAITING FOR OPPONENT';
      document.getElementById('action-panel').style.display = 'none';
      return;
    }

    updateArenaUI(game);
    updateActionPanel(game);
    document.getElementById('game-info-label').textContent =
      `Game #${battleState.gameId} · Turn ${Number(game.turnNumber) + 1}`;
  } catch (err) {
    console.error('Error refreshing:', err);
  }
}

function updateArenaUI(game) {
  const amP1 = battleState.amPlayer1;
  const me = amP1 ? game.player1 : game.player2;
  const opp = amP1 ? game.player2 : game.player1;

  // My active card
  const myActiveIdx = Number(me.activeCardIdx);
  const myCard = me.cards[myActiveIdx];
  const myHpPct = Number(myCard.maxHp) > 0 ? Number(myCard.hp) / Number(myCard.maxHp) * 100 : 0;
  const myCardId = Number(me.cardIds[myActiveIdx]);
  const myCached = myOwnedCards.find(c => c.tokenId === myCardId);
  const myCls = myCached ? CLASS_NAMES[Number(myCached.stats.cardClass)] : 'Warrior';

  document.getElementById('my-active-icon').textContent = CLASS_ICONS[myCls] || '⚔️';
  document.getElementById('my-active-icon').style.color = CLASS_COLORS[myCls] || 'var(--cyan)';
  document.getElementById('my-active-name').textContent = myCached ? myCached.stats.name : `Card #${myCardId}`;
  document.getElementById('my-hp-bar').style.width = `${myHpPct}%`;
  document.getElementById('my-hp-bar').style.background = myHpPct > 50 ? 'linear-gradient(90deg,#15803d,#22c55e)' : myHpPct > 25 ? 'linear-gradient(90deg,#b45309,#f59e0b)' : 'linear-gradient(90deg,#991b1b,#ef4444)';
  document.getElementById('my-hp-text').textContent = `${myCard.hp}/${myCard.maxHp} HP`;

  // Opponent active card
  const oppActiveIdx = Number(opp.activeCardIdx);
  const oppCard = opp.cards[oppActiveIdx];
  const oppHpPct = Number(oppCard.maxHp) > 0 ? Number(oppCard.hp) / Number(oppCard.maxHp) * 100 : 0;

  document.getElementById('opp-active-name').textContent = `Card #${opp.cardIds[oppActiveIdx]}`;
  document.getElementById('opp-hp-bar').style.width = `${oppHpPct}%`;
  document.getElementById('opp-hp-text').textContent = `${oppCard.hp}/${oppCard.maxHp} HP`;

  // Address labels
  document.getElementById('my-addr-short').textContent = shortAddr(DW.userAddress);
  document.getElementById('opp-addr-short').textContent = shortAddr(amP1 ? game.player2.addr : game.player1.addr);

  // Bench
  renderBench('my-bench', me.cards, myActiveIdx);
  renderBench('opp-bench', opp.cards, oppActiveIdx);

  // Commit status indicators
  updateCommitIndicators(game, amP1);
}

function renderBench(containerId, cards, activeIdx) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const card = cards[i];
    el.innerHTML += buildMiniBenchCard(card, i === activeIdx, Number(card.hp) === 0);
  }
}

function updateCommitIndicators(game, amP1) {
  const meCommit = amP1 ? Number(game.player1.commitStatus) : Number(game.player2.commitStatus);
  const oppCommit = amP1 ? Number(game.player2.commitStatus) : Number(game.player1.commitStatus);
  const setInd = (id, status) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'commit-indicator ' + ['pending','committed','revealed'][status];
    el.textContent = ['❓','🔒','✅'][status];
  };
  setInd('p1-commit-ind', meCommit);
  setInd('p2-commit-ind', oppCommit);
}

async function updateActionPanel(game) {
  const amP1 = battleState.amPlayer1;
  const me = amP1 ? game.player1 : game.player2;
  const myCommit = Number(me.commitStatus);

  const chooseDiv  = document.getElementById('step-choose-move');
  const revealDiv  = document.getElementById('step-reveal-move');
  const waitingDiv = document.getElementById('step-waiting');
  const actionTitle = document.getElementById('action-title');

  if (myCommit === CommitStatus.None) {
    // Show move picker
    chooseDiv.style.display = 'block';
    revealDiv.style.display = 'none';
    waitingDiv.style.display = 'none';
    actionTitle.textContent = 'SELECT YOUR MOVE — TURN ' + (Number(game.turnNumber) + 1);
    await renderMovesGrid(me);
    document.getElementById('turn-badge').textContent = 'COMMIT PHASE';
  } else if (myCommit === CommitStatus.Committed) {
    // Waiting for opponent to commit, or both committed → show reveal
    const oppCommit = amP1 ? Number(game.player2.commitStatus) : Number(game.player1.commitStatus);
    chooseDiv.style.display = 'none';
    waitingDiv.style.display = 'none';
    revealDiv.style.display = 'block';
    const revealBtn = document.getElementById('reveal-btn');
    if (oppCommit === CommitStatus.Committed) {
      revealBtn.disabled = false;
      document.getElementById('reveal-hint').textContent = 'Both players committed! Click to reveal.';
      document.getElementById('turn-badge').textContent = 'REVEAL PHASE';
    } else {
      revealBtn.disabled = true;
      document.getElementById('reveal-hint').textContent = 'Waiting for opponent to commit...';
      document.getElementById('turn-badge').textContent = 'WAITING FOR OPPONENT';
    }
  } else if (myCommit === CommitStatus.Revealed) {
    chooseDiv.style.display = 'none';
    revealDiv.style.display = 'none';
    waitingDiv.style.display = 'block';
    document.getElementById('waiting-text').textContent = 'WAITING FOR OPPONENT TO REVEAL...';
    document.getElementById('turn-badge').textContent = 'OPPONENT REVEALING';
  }
}

async function renderMovesGrid(me) {
  const grid = document.getElementById('moves-grid');
  grid.innerHTML = '<span style="color:var(--text-muted);">Loading moves...</span>';
  const myActiveIdx = Number(me.activeCardIdx);
  const myCardId = Number(me.cardIds[myActiveIdx]);

  try {
    const stats = await DW.cardContract.getCardStats(myCardId);
    const moveInfos = await Promise.all(stats.moves.slice(0, Number(stats.moveCount)).map(addr => getMoveInfo(addr)));

    grid.innerHTML = '';
    moveInfos.forEach((m, i) => {
      const btn = document.createElement('button');
      btn.className = 'move-btn' + (battleState.selectedMoveIndex === i ? ' selected' : '');
      btn.innerHTML = `
        <div class="move-name">${m.name}</div>
        <div class="move-desc">${m.description}</div>
        <div class="move-power-bar"><div class="move-power-fill" style="width:${m.power}%;"></div></div>
      `;
      btn.addEventListener('click', () => selectMove(i));
      grid.appendChild(btn);
    });
  } catch (err) {
    grid.innerHTML = `<span style="color:var(--red);">Error: ${err.message}</span>`;
  }
}

function selectMove(idx) {
  battleState.selectedMoveIndex = idx;
  document.querySelectorAll('.move-btn').forEach((b, i) => b.classList.toggle('selected', i === idx));
  document.getElementById('commit-btn').disabled = false;
}

// ─── COMMIT-REVEAL LOGIC ─────────────────────────────────────────────────────

async function commitMove() {
  if (battleState.selectedMoveIndex === null) { toast('Select a move first!', 'warning'); return; }
  setBtn('commit-btn', '<span class="spinner"></span> Committing...', true);
  try {
    // Generate a random secret
    const secretArr = new Uint8Array(32);
    crypto.getRandomValues(secretArr);
    const secret = BigInt('0x' + Array.from(secretArr).map(b => b.toString(16).padStart(2,'0')).join(''));

    // Build commit hash
    const commitHash = await DW.gameContract.generateCommitHash(
      battleState.selectedMoveIndex,
      secret,
      DW.userAddress
    );

    // Store secret for reveal phase
    battleState.mySecret = secret;
    sessionStorage.setItem(`dw_secret_${battleState.gameId}_${battleState.game?.turnNumber}`, secret.toString());

    const tx = await DW.gameContract.commitMove(battleState.gameId, commitHash);
    toast('Committing move...', 'info');
    await tx.wait();
    toast('Move committed! Now wait for opponent.', 'success');
    addLog(`🔒 You committed your move (Turn ${Number(battleState.game.turnNumber) + 1})`, 'highlight');
    await refreshBattleState();
  } catch (err) {
    toast('Commit failed: ' + (err.reason || err.message), 'error');
    setBtn('commit-btn', '🔒 Commit Move', false);
  }
}

async function revealMove() {
  setBtn('reveal-btn', '<span class="spinner"></span> Revealing...', true);
  try {
    // Retrieve stored secret
    let secret = battleState.mySecret;
    if (!secret) {
      const stored = sessionStorage.getItem(`dw_secret_${battleState.gameId}_${battleState.game?.turnNumber}`);
      if (!stored) { toast('Secret lost! Cannot reveal. Use a fresh game.', 'error'); return; }
      secret = BigInt(stored);
    }

    const tx = await DW.gameContract.revealMove(
      battleState.gameId,
      battleState.selectedMoveIndex,
      secret
    );
    toast('Revealing move...', 'info');
    const receipt = await tx.wait();

    // Check if turn resolved
    for (const log of receipt.logs) {
      try {
        const parsed = DW.gameContract.interface.parseLog(log);
        if (parsed?.name === 'TurnResolved') {
          addLog(`⚡ Turn resolved! Combined seed: ${parsed.args.combinedSeed.toString(16).slice(0,12)}...`, 'system');
        }
        if (parsed?.name === 'CardFainted') {
          addLog(`💀 ${parsed.args.player1Card ? 'Your' : "Opponent's"} card #${parsed.args.cardIdx} fainted!`, 'damage');
        }
        if (parsed?.name === 'GameOver') {
          const winner = parsed.args.winner;
          if (winner.toLowerCase() === DW.userAddress.toLowerCase()) {
            addLog(`🏆 You won! Prize: ${ethers.formatEther(parsed.args.prize)} HLUSD`, 'winner');
          } else {
            addLog(`💔 You lost the battle.`, 'damage');
          }
        }
      } catch {}
    }

    battleState.selectedMoveIndex = null;
    battleState.mySecret = null;
    toast('Turn resolved!', 'success');
    await refreshBattleState();
  } catch (err) {
    toast('Reveal failed: ' + (err.reason || err.message), 'error');
    setBtn('reveal-btn', '✅ Reveal Move & Resolve Turn', false);
  }
}

// ─── FORFEIT / TIMEOUT ───────────────────────────────────────────────────────

async function forfeitGame() {
  if (!battleState.gameId) return;
  if (!confirm('Are you sure you want to forfeit? Your opponent wins.')) return;
  try {
    const tx = await DW.gameContract.forfeit(battleState.gameId);
    await tx.wait();
    toast('You forfeited the game.', 'warning');
    addLog('🏳️ You forfeited the game.', 'damage');
    await refreshBattleState();
  } catch (err) {
    toast('Forfeit failed: ' + (err.reason || err.message), 'error');
  }
}

async function claimTimeoutVictory() {
  if (!battleState.gameId) return;
  try {
    const tx = await DW.gameContract.claimTimeout(battleState.gameId);
    await tx.wait();
    toast('Timeout claimed!', 'success');
    addLog('⏱️ Timeout claimed — opponent failed to act.', 'system');
    await refreshBattleState();
  } catch (err) {
    toast('Cannot claim timeout yet: ' + (err.reason || err.message), 'warning');
  }
}

// ─── GAME OVER ───────────────────────────────────────────────────────────────

function showGameOver(game) {
  stopPolling();
  document.getElementById('battle-screen').style.display = 'none';
  document.getElementById('game-over-screen').style.display = 'block';

  const iWon = game.winner.toLowerCase() === DW.userAddress.toLowerCase();
  document.getElementById('result-icon').textContent = iWon ? '🏆' : '💔';
  document.getElementById('result-title').textContent = iWon ? 'VICTORY!' : 'DEFEAT';
  document.getElementById('result-title').style.color = iWon ? 'var(--gold)' : 'var(--red)';
  const prize = ethers.formatEther(BigInt(game.wager) * 2n);
  document.getElementById('result-subtitle').textContent = iWon
    ? `You won ${prize} HLUSD! 🎉`
    : `Better luck next time. ${shortAddr(game.winner)} wins.`;
}

function resetBattle() {
  battleState = {
    gameId: null, game: null, amPlayer1: false,
    myCards: [], oppCards: [],
    selectedMoveIndex: null, mySecret: null,
    eventListeners: [], pollInterval: null,
  };
  document.getElementById('game-over-screen').style.display = 'none';
  document.getElementById('battle-screen').style.display = 'none';
  document.getElementById('battle-lobby').style.display = 'block';
  document.getElementById('battle-log').innerHTML = '<div class="log-entry system">Battle started. Commit your move to begin the first turn!</div>';
}

// ─── POLLING ─────────────────────────────────────────────────────────────────
// Poll every 5 seconds to check for opponent actions

function startPolling() {
  if (battleState.pollInterval) clearInterval(battleState.pollInterval);
  battleState.pollInterval = setInterval(async () => {
    if (!battleState.gameId) return;
    const prev = battleState.game ? {
      turn: Number(battleState.game.turnNumber),
      p1Status: Number(battleState.game.player1.commitStatus),
      p2Status: Number(battleState.game.player2.commitStatus),
      status: Number(battleState.game.status),
    } : null;

    await refreshBattleState();

    if (prev && battleState.game) {
      const curr = {
        turn: Number(battleState.game.turnNumber),
        p1Status: Number(battleState.game.player1.commitStatus),
        p2Status: Number(battleState.game.player2.commitStatus),
      };
      const amP1 = battleState.amPlayer1;
      const oppCommitPrev = amP1 ? prev.p2Status : prev.p1Status;
      const oppCommitCurr = amP1 ? curr.p2Status : curr.p1Status;

      if (oppCommitPrev === CommitStatus.None && oppCommitCurr === CommitStatus.Committed) {
        toast('Opponent committed their move!', 'info');
        addLog('🔒 Opponent committed their move.', 'highlight');
      }
      if (curr.turn > prev.turn) {
        addLog(`✅ Turn ${curr.turn} completed!`, 'system');
      }
    }
  }, 5000);
}

function stopPolling() {
  if (battleState.pollInterval) clearInterval(battleState.pollInterval);
}

// ─── BATTLE LOG ──────────────────────────────────────────────────────────────

function addLog(msg, type = '') {
  const log = document.getElementById('battle-log');
  if (!log) return;
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[T${battleState.game ? Number(battleState.game.turnNumber) + 1 : 0}] ${msg}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}
