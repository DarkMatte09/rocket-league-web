/**
 * Rocket League Web — Bot Ranks & Skill Scaling Engine
 * Calibrates the Nexto AI neural network across 7 authentic Rocket League ranks:
 * Bronze, Silver, Gold, Platinum, Diamond, Champion, Supersonic Legend (SSL)
 */

(function () {
  const RANKS = {
    bronze: {
      id: 'bronze',
      name: 'Bronzo I',
      subtitle: 'Rookie Bot',
      icon: '🥉',
      color: '#cd7f32',
      glow: 'rgba(205, 127, 50, 0.4)',
      bg: 'rgba(205, 127, 50, 0.12)',
      border: 'rgba(205, 127, 50, 0.5)',
      description: 'Sterzo impreciso, velocità limitata, niente boost o salti aerei.',
      delayTicks: 28, // ~230ms reaction lag
      allowBoost: false,
      allowJump: false,
      allowAerial: false,
      steerNoise: 0.35,
      throttleCap: 0.75,
      reactionSkipChance: 0.35
    },
    silver: {
      id: 'silver',
      name: 'Argento II',
      subtitle: 'Principiante',
      icon: '🥈',
      color: '#c0c0c0',
      glow: 'rgba(192, 192, 192, 0.4)',
      bg: 'rgba(192, 192, 192, 0.12)',
      border: 'rgba(192, 192, 192, 0.5)',
      description: 'Insegue la palla a terra, usa poco boost e fa solo salti singoli.',
      delayTicks: 18, // ~150ms reaction lag
      allowBoost: true,
      boostGroundOnly: true,
      allowJump: true,
      jumpSingleOnly: true,
      allowAerial: false,
      steerNoise: 0.18,
      throttleCap: 0.9,
      reactionSkipChance: 0.15
    },
    gold: {
      id: 'gold',
      name: 'Oro III',
      subtitle: 'Intermedio',
      icon: '🥇',
      color: '#ffd700',
      glow: 'rgba(255, 215, 0, 0.4)',
      bg: 'rgba(255, 215, 0, 0.12)',
      border: 'rgba(255, 215, 0, 0.5)',
      description: 'Esegue flip in avanti, power shot e difende la propria porta.',
      delayTicks: 11, // ~90ms reaction lag
      allowBoost: true,
      boostGroundOnly: false,
      allowJump: true,
      allowAerial: false,
      steerNoise: 0.08,
      throttleCap: 1.0,
      reactionSkipChance: 0.05
    },
    platinum: {
      id: 'platinum',
      name: 'Platino II',
      subtitle: 'Avanzato',
      icon: '💠',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.45)',
      bg: 'rgba(0, 240, 255, 0.12)',
      border: 'rgba(0, 240, 255, 0.5)',
      description: 'Tiri aerei bassi, recuperi rapidi, wave dash e gestione del boost.',
      delayTicks: 6, // ~50ms reaction lag
      allowBoost: true,
      allowJump: true,
      allowAerial: true,
      aerialMaxPitch: 0.7,
      steerNoise: 0.03,
      throttleCap: 1.0,
      reactionSkipChance: 0.0
    },
    diamond: {
      id: 'diamond',
      name: 'Diamante III',
      subtitle: 'Esperto',
      icon: '💎',
      color: '#70b5ff',
      glow: 'rgba(112, 181, 255, 0.5)',
      bg: 'rgba(112, 181, 255, 0.12)',
      border: 'rgba(112, 181, 255, 0.55)',
      description: 'Fast aerials, letture a muro e contese aggressive della palla.',
      delayTicks: 3, // ~25ms
      allowBoost: true,
      allowJump: true,
      allowAerial: true,
      steerNoise: 0.01,
      throttleCap: 1.0,
      reactionSkipChance: 0.0
    },
    champion: {
      id: 'champion',
      name: 'Campione II',
      subtitle: 'Maestro',
      icon: '👑',
      color: '#c77dff',
      glow: 'rgba(199, 125, 255, 0.55)',
      bg: 'rgba(199, 125, 255, 0.15)',
      border: 'rgba(199, 125, 255, 0.6)',
      description: 'Aerial ad alta quota, tiri precisi e shadow defense impenetrabile.',
      delayTicks: 1, // ~8ms
      allowBoost: true,
      allowJump: true,
      allowAerial: true,
      steerNoise: 0.0,
      throttleCap: 1.0,
      reactionSkipChance: 0.0
    },
    ssl: {
      id: 'ssl',
      name: 'Supersonic Legend',
      subtitle: 'Nexto AI Pura',
      icon: '🌌',
      color: '#ff7700',
      glow: 'rgba(255, 119, 0, 0.6)',
      bg: 'rgba(255, 119, 0, 0.16)',
      border: 'rgba(255, 119, 0, 0.7)',
      description: '100% rete neurale Nexto non filtrata a 120Hz. Livello pro esports.',
      delayTicks: 0, // 0ms real-time
      allowBoost: true,
      allowJump: true,
      allowAerial: true,
      steerNoise: 0.0,
      throttleCap: 1.0,
      reactionSkipChance: 0.0
    }
  };

  const STORAGE_KEY = 'car-soccer.bot-rank';
  let currentRankId = localStorage.getItem(STORAGE_KEY) || 'gold';
  if (!RANKS[currentRankId]) currentRankId = 'gold';

  // Action delay queue to simulate human reaction delay
  let actionQueue = [];
  let jumpCooldown = 0;

  function resetQueue() {
    actionQueue = [];
    jumpCooldown = 0;
  }

  function getCurrentRank() {
    return RANKS[currentRankId] || RANKS.gold;
  }

  function setRank(rankId) {
    if (RANKS[rankId]) {
      currentRankId = rankId;
      localStorage.setItem(STORAGE_KEY, rankId);
      resetQueue();
      updateMatchUIDescription();
      updateRankButtons();
    }
  }

  function filterControls(rawAction, sim) {
    const rank = getCurrentRank();
    if (!rawAction) return rawAction;

    // Clone action
    let act = { ...rawAction };

    // Human lag queue
    if (rank.delayTicks > 0) {
      actionQueue.push({ ...act });
      if (actionQueue.length > rank.delayTicks) {
        act = actionQueue.shift();
      } else {
        // Return neutral action while filling lag buffer
        act = { throttle: 0, steer: 0, pitch: 0, yaw: 0, roll: 0, jump: false, boost: false, handbrake: false };
      }
    }

    // Reaction skip chance (occasional hesitation / brain lag)
    if (rank.reactionSkipChance > 0 && Math.random() < rank.reactionSkipChance) {
      act.throttle = Math.min(act.throttle, 0.2);
      act.boost = false;
    }

    // Boost filter
    if (!rank.allowBoost) {
      act.boost = false;
    } else if (rank.boostGroundOnly) {
      // Silver: no aerial boost
      if (act.pitch !== 0 || act.yaw !== 0 || act.jump) {
        act.boost = false;
      }
    }

    // Jump filter
    if (!rank.allowJump) {
      act.jump = false;
    } else if (rank.jumpSingleOnly) {
      if (act.jump) {
        if (jumpCooldown > 0) {
          act.jump = false;
        } else {
          jumpCooldown = 30; // Prevent second jump for double jump
        }
      }
    }
    if (jumpCooldown > 0) jumpCooldown--;

    // Aerial filter
    if (!rank.allowAerial) {
      act.pitch = 0;
      act.yaw = 0;
      act.roll = 0;
    } else if (rank.aerialMaxPitch) {
      act.pitch = Math.max(-rank.aerialMaxPitch, Math.min(rank.aerialMaxPitch, act.pitch));
      act.yaw = Math.max(-rank.aerialMaxPitch, Math.min(rank.aerialMaxPitch, act.yaw));
    }

    // Steering noise / inaccuracy
    if (rank.steerNoise > 0) {
      const noise = (Math.random() - 0.5) * 2 * rank.steerNoise;
      act.steer = Math.max(-1, Math.min(1, act.steer + noise));
    }

    // Throttle cap
    if (rank.throttleCap < 1.0) {
      act.throttle = Math.max(-1, Math.min(1, act.throttle * rank.throttleCap));
    }

    return act;
  }

  function updateMatchUIDescription() {
    const rank = getCurrentRank();
    const nameEl = document.querySelector('[data-match="bot-name"]');
    const descEl = document.querySelector('[data-match="bot-description"]');
    if (nameEl) {
      nameEl.textContent = `${rank.icon} ${rank.name}`;
      nameEl.style.color = rank.color;
    }
    if (descEl) {
      descEl.textContent = `${rank.subtitle} — ${rank.description}`;
    }
  }

  function updateRankButtons() {
    document.querySelectorAll('.rank-card').forEach((card) => {
      const isSel = card.dataset.rank === currentRankId;
      card.classList.toggle('is-selected', isSel);
      card.setAttribute('aria-checked', isSel ? 'true' : 'false');
    });
  }

  function injectRankSelectorUI() {
    const matchDialog = document.querySelector('#match-dialog .match-panel__body');
    if (!matchDialog || document.getElementById('bot-rank-selector')) return;

    const rankWrap = document.createElement('div');
    rankWrap.id = 'bot-rank-selector';
    rankWrap.className = 'bot-rank-selector';
    rankWrap.innerHTML = `
      <div class="match-panel__section-label">
        <span>Livello Bot / Abilità</span>
        <span id="rank-badge-preview">${getCurrentRank().icon} ${getCurrentRank().name}</span>
      </div>
      <div class="rank-grid">
        ${Object.values(RANKS)
          .map(
            (r) => `
          <button type="button" class="rank-card ${r.id === currentRankId ? 'is-selected' : ''}" 
                  data-rank="${r.id}" 
                  role="radio" 
                  aria-checked="${r.id === currentRankId ? 'true' : 'false'}"
                  style="--rank-color: ${r.color}; --rank-bg: ${r.bg}; --rank-border: ${r.border}; --rank-glow: ${r.glow};">
            <span class="rank-card__icon">${r.icon}</span>
            <div class="rank-card__info">
              <strong class="rank-card__name">${r.name}</strong>
              <span class="rank-card__sub">${r.subtitle}</span>
            </div>
            <span class="rank-card__radio"></span>
          </button>
        `
          )
          .join('')}
      </div>
    `;

    // Insert after opponent card
    const opponent = matchDialog.querySelector('.match-opponent');
    if (opponent && opponent.nextSibling) {
      matchDialog.insertBefore(rankWrap, opponent.nextSibling);
    } else {
      matchDialog.appendChild(rankWrap);
    }

    // Attach click events
    rankWrap.querySelectorAll('.rank-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setRank(card.dataset.rank);
        const preview = document.getElementById('rank-badge-preview');
        if (preview) preview.textContent = `${getCurrentRank().icon} ${getCurrentRank().name}`;
      });
    });

    updateMatchUIDescription();
  }

  // Hook into window
  window.__rl_botRanks = {
    ranks: RANKS,
    getCurrentRank,
    setRank,
    filter: filterControls,
    resetQueue,
    injectUI: injectRankSelectorUI
  };

  // Auto-hook filter
  window.__rl_filterBotControls = filterControls;

  // Watch for Match modal openings
  const observer = new MutationObserver(() => {
    injectRankSelectorUI();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    // Also try immediately
    setTimeout(injectRankSelectorUI, 500);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(injectRankSelectorUI, 500);
    });
  }
})();
