/**
 * Rocket League Web — Online Private Multiplayer (P2P WebRTC)
 * Connects friends in private 1v1 rooms directly via PeerJS WebRTC DataChannels.
 * Zero-server architecture: Host runs authoritative RocketSim physics, Guest streams controls.
 */

(function () {
  let peer = null;
  let connection = null;
  let isHost = false;
  let isGuest = false;
  let currentCleanCode = null;
  let remoteControls = { throttle: 0, steer: 0, pitch: 0, yaw: 0, roll: 0, jump: false, boost: false, handbrake: false };
  let ping = 0;
  let lastPingTime = 0;
  let stateSendInterval = null;
  let pingInterval = null;
  let connectTimeout = null;

  // Global ICE configuration with Google STUN + Cloudflare + OpenRelay TURN
  const ICE_CONFIG = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
      { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
    ]
  };

  // Quick Chat Messages
  const QUICK_CHATS = {
    1: '🎯 Bel tiro!',
    2: '🛡️ Bella parata!',
    3: '🚀 Grande passaggio!',
    4: '💥 Oops!'
  };

  function normalizeCode(raw) {
    if (!raw) return '';
    let clean = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.startsWith('RL') && clean.length > 2) clean = clean.slice(2);
    return clean;
  }

  function getDisplayCode(clean) {
    return 'RL-' + clean;
  }

  function getPeerId(clean) {
    return 'rlw-rl-' + clean.toLowerCase();
  }

  function generateRandomCleanCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function showToast(title, subtitle, type = 'info') {
    let toast = document.getElementById('rl-multiplayer-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'rl-multiplayer-toast';
      toast.className = 'multiplayer-toast';
      document.body.appendChild(toast);
    }
    toast.className = `multiplayer-toast is-visible type-${type}`;
    toast.innerHTML = `
      <div class="toast-title">${title}</div>
      ${subtitle ? `<div class="toast-sub">${subtitle}</div>` : ''}
    `;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3500);
  }

  function triggerQuickChat(num) {
    const msg = QUICK_CHATS[num];
    if (!msg) return;

    const senderName = isHost ? 'Host (Blu)' : 'Guest (Arancio)';
    showToast(msg, senderName, 'chat');

    if (connection && connection.open) {
      connection.send({
        type: 'chat',
        msg,
        sender: senderName
      });
    }
  }

  // Keyboard shortcut listener for Quick Chat (1, 2, 3, 4)
  window.addEventListener('keydown', (e) => {
    if (!connection || !connection.open) return;
    if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
      const num = parseInt(e.code.replace('Digit', ''), 10);
      triggerQuickChat(num);
    }
  });

  // Ensure Peer library is available
  function ensurePeerLibrary(callback) {
    if (typeof window.Peer !== 'undefined') {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = './peerjs.min.js';
    script.onload = () => callback();
    script.onerror = () => {
      updateLobbyUI('error', 'Impossibile caricare il motore WebRTC (peerjs). Ricarica la pagina.');
    };
    document.head.appendChild(script);
  }

  // Create Private Room (Host)
  function createRoom() {
    ensurePeerLibrary(() => {
      if (peer) {
        try { peer.destroy(); } catch (e) {}
      }

      currentCleanCode = generateRandomCleanCode();
      const displayCode = getDisplayCode(currentCleanCode);
      const peerId = getPeerId(currentCleanCode);
      isHost = true;
      isGuest = false;

      updateLobbyUI('connecting', `Inizializzazione stanza ${displayCode}...`);

      try {
        peer = new window.Peer(peerId, {
          debug: 1,
          config: ICE_CONFIG
        });

        peer.on('open', (id) => {
          updateLobbyUI('waiting', displayCode);
          showToast('Stanza Creata!', `Codice: ${displayCode}. Invia il link o codice al tuo amico.`, 'success');
        });

        peer.on('connection', (conn) => {
          connection = conn;
          setupConnectionHandlers(conn);
        });

        peer.on('error', (err) => {
          console.warn('PeerJS Host Error:', err);
          if (err.type === 'unavailable-id') {
            // ID conflict, retry with new code
            setTimeout(createRoom, 200);
          } else {
            updateLobbyUI('error', `Errore connessione: ${err.message || err.type}`);
          }
        });
      } catch (e) {
        updateLobbyUI('error', `Errore WebRTC: ${e.message}`);
      }
    });
  }

  // Join Private Room (Guest)
  function joinRoom(rawCode) {
    const clean = normalizeCode(rawCode);
    if (!clean) {
      updateLobbyUI('error', 'Inserisci un codice stanza valido (es. RL-8492 o 8492).');
      return;
    }

    ensurePeerLibrary(() => {
      if (peer) {
        try { peer.destroy(); } catch (e) {}
      }

      currentCleanCode = clean;
      const displayCode = getDisplayCode(clean);
      const hostPeerId = getPeerId(clean);
      isHost = false;
      isGuest = true;

      updateLobbyUI('connecting', `Connessione alla stanza ${displayCode}...`);

      clearTimeout(connectTimeout);
      connectTimeout = setTimeout(() => {
        if (!connection || !connection.open) {
          updateLobbyUI('error', `Timeout: impossibile connettersi alla stanza ${displayCode}. Verifica che l'Host abbia già creato la stanza e sia online.`);
          if (connection) {
            try { connection.close(); } catch (e) {}
          }
        }
      }, 10000);

      try {
        peer = new window.Peer({
          debug: 1,
          config: ICE_CONFIG
        });

        peer.on('open', (myId) => {
          updateLobbyUI('connecting', `Ricerca Host per la stanza ${displayCode}...`);
          
          // Connect to Host with standard reliable DataChannel
          const conn = peer.connect(hostPeerId, {
            reliable: true
          });
          connection = conn;
          setupConnectionHandlers(conn);
        });

        peer.on('error', (err) => {
          console.warn('PeerJS Guest Error:', err);
          clearTimeout(connectTimeout);
          if (err.type === 'peer-unavailable') {
            updateLobbyUI('error', `Stanza ${displayCode} non trovata. L'Host deve prima cliccare "Crea Stanza Privata".`);
          } else {
            updateLobbyUI('error', `Errore connessione: ${err.message || err.type}`);
          }
        });
      } catch (e) {
        clearTimeout(connectTimeout);
        updateLobbyUI('error', `Errore WebRTC: ${e.message}`);
      }
    });
  }

  function setupConnectionHandlers(conn) {
    conn.on('open', () => {
      clearTimeout(connectTimeout);
      const displayCode = getDisplayCode(currentCleanCode);
      updateLobbyUI('connected', displayCode);
      showToast('Amico Connesso!', 'La partita online 1v1 è attiva!', 'success');

      // Start ping heartbeat
      clearInterval(pingInterval);
      pingInterval = setInterval(() => {
        if (conn && conn.open) {
          lastPingTime = performance.now();
          conn.send({ type: 'ping', t: lastPingTime });
        }
      }, 1000);

      // Start role-specific loops
      if (isHost) {
        startHostMatch();
      } else {
        startGuestMatch();
      }
    });

    conn.on('data', (data) => {
      handleIncomingData(data);
    });

    conn.on('close', () => {
      clearTimeout(connectTimeout);
      showToast('Disconnesso', 'L\'amico si è disconnesso dalla partita.', 'warning');
      cleanupMultiplayer();
    });

    conn.on('error', (err) => {
      console.warn('DataChannel Error:', err);
      clearTimeout(connectTimeout);
      updateLobbyUI('error', 'Errore DataChannel durante la connessione.');
    });
  }

  function handleIncomingData(data) {
    if (!data || !data.type) return;

    if (data.type === 'ping') {
      if (connection && connection.open) {
        connection.send({ type: 'pong', t: data.t });
      }
      return;
    }

    if (data.type === 'pong') {
      ping = Math.max(1, Math.round(performance.now() - data.t));
      updatePingUI(ping);
      return;
    }

    if (data.type === 'chat') {
      showToast(data.msg, data.sender, 'chat');
      return;
    }

    if (data.type === 'input' && isHost) {
      // Guest sending inputs to Host
      remoteControls = data.controls || remoteControls;
      return;
    }

    if (data.type === 'state' && isGuest) {
      // Host sending physics state to Guest
      applyHostStateToGuest(data);
      return;
    }
  }

  function startHostMatch() {
    const sim = window.__rl_sim;
    const sceneManager = window.__rl_sceneManager;
    const match = window.__rl_match;
    const matchUI = window.__rl_matchUI;

    if (sim && sceneManager) {
      // Configure 2 cars: Host is Car 0 (Blue), Guest is Car 1 (Orange)
      sim.configureCars('default', true);
      sim.resetKickoff();
      if (match) match.start();
      if (matchUI) {
        matchUI.hide();
        matchUI.update(match.state);
      }
    }

    // Host broadcast loop (~45Hz)
    clearInterval(stateSendInterval);
    stateSendInterval = setInterval(() => {
      if (!connection || !connection.open || !sim) return;

      const state = sim.state;
      if (!state) return;

      const snapshot = {
        type: 'state',
        scoreBlue: match ? match.state.blueScore : 0,
        scoreOrange: match ? match.state.orangeScore : 0,
        time: match ? match.state.remainingSeconds : 300,
        phase: match ? match.state.phase : 'playing',
        simState: Array.from(state.subarray(0, 120))
      };

      connection.send(snapshot);
    }, 22);
  }

  function startGuestMatch() {
    const sim = window.__rl_sim;
    const sceneManager = window.__rl_sceneManager;
    const matchUI = window.__rl_matchUI;

    if (sim) {
      // Configure arena with opponent for guest
      sim.configureCars('default', true);
    }
    if (matchUI) matchUI.hide();

    // Guest input sending loop (60Hz)
    clearInterval(stateSendInterval);
    stateSendInterval = setInterval(() => {
      if (!connection || !connection.open) return;

      const localControls = window.__rl_currentControls || {
        throttle: 0,
        steer: 0,
        pitch: 0,
        yaw: 0,
        roll: 0,
        jump: false,
        boost: false,
        handbrake: false
      };

      connection.send({
        type: 'input',
        controls: localControls
      });
    }, 16);
  }

  function applyHostStateToGuest(data) {
    const sim = window.__rl_sim;
    const match = window.__rl_match;
    const matchUI = window.__rl_matchUI;

    if (sim && data.simState) {
      sim.state.set(data.simState);
    }

    if (match) {
      match.state.blueScore = data.scoreBlue;
      match.state.orangeScore = data.scoreOrange;
      match.state.remainingSeconds = data.time;
      match.state.phase = data.phase;
      if (matchUI) matchUI.update(match.state);
    }
  }

  function cleanupMultiplayer() {
    clearTimeout(connectTimeout);
    clearInterval(stateSendInterval);
    clearInterval(pingInterval);
    if (connection) {
      try { connection.close(); } catch (e) {}
      connection = null;
    }
    if (peer) {
      try { peer.destroy(); } catch (e) {}
      peer = null;
    }
    isHost = false;
    isGuest = false;
    currentCleanCode = null;
    remoteControls = { throttle: 0, steer: 0, pitch: 0, yaw: 0, roll: 0, jump: false, boost: false, handbrake: false };
    updateLobbyUI('idle');
    updatePingUI(0);
  }

  // UI Injection & Management
  function injectMultiplayerUI() {
    const matchDialog = document.querySelector('#match-dialog .match-panel__body');
    if (!matchDialog || document.getElementById('multiplayer-lobby-panel')) return;

    const mpPanel = document.createElement('div');
    mpPanel.id = 'multiplayer-lobby-panel';
    mpPanel.className = 'multiplayer-lobby-panel';
    mpPanel.innerHTML = `
      <div class="match-mode-tabs">
        <button type="button" class="match-mode-tab is-active" data-mode="bot">
          <span>🤖 1v1 vs Bot</span>
        </button>
        <button type="button" class="match-mode-tab" data-mode="online">
          <span>🌐 1v1 Online con Amici</span>
        </button>
      </div>

      <div id="mp-content-online" class="mp-content" style="display: none;">
        <div class="mp-card">
          <div class="mp-card__header">
            <strong>PARTITA PRIVATA ONLINE</strong>
            <span class="mp-badge-p2p">WebRTC P2P</span>
          </div>

          <div id="mp-status-area" class="mp-status-area">
            <p class="mp-hint">Crea una stanza privata e condividi il codice con il tuo amico, oppure inserisci il codice che ti ha inviato.</p>
          </div>

          <div class="mp-actions-grid">
            <button type="button" id="btn-create-room" class="mp-btn mp-btn--primary">
              <span class="mp-btn__icon">➕</span>
              <span class="mp-btn__text">Crea Stanza Privata</span>
            </button>

            <div class="mp-join-wrap">
              <input type="text" id="input-room-code" class="mp-input" placeholder="Codice (es. RL-8492 o 8492)" maxlength="10" />
              <button type="button" id="btn-join-room" class="mp-btn mp-btn--secondary">
                <span>Partecipa</span>
              </button>
            </div>
          </div>

          <div class="mp-quick-chat-hints">
            <span class="chat-hint-label">Quick Chat in partita:</span>
            <span class="chat-hint-key"><kbd>1</kbd> Bel tiro!</span>
            <span class="chat-hint-key"><kbd>2</kbd> Bella parata!</span>
            <span class="chat-hint-key"><kbd>3</kbd> Passaggio!</span>
            <span class="chat-hint-key"><kbd>4</kbd> Oops!</span>
          </div>
        </div>
      </div>
    `;

    matchDialog.insertBefore(mpPanel, matchDialog.firstChild);

    // Tab Switching
    const botTab = mpPanel.querySelector('[data-mode="bot"]');
    const onlineTab = mpPanel.querySelector('[data-mode="online"]');
    const onlineContent = mpPanel.querySelector('#mp-content-online');
    const opponentSection = matchDialog.querySelector('.match-opponent');
    const botRankSection = document.getElementById('bot-rank-selector');
    const startBtn = document.querySelector('[data-match="start"]');

    botTab.addEventListener('click', () => {
      botTab.classList.add('is-active');
      onlineTab.classList.remove('is-active');
      onlineContent.style.display = 'none';
      if (opponentSection) opponentSection.style.display = '';
      if (botRankSection) botRankSection.style.display = '';
      if (startBtn) startBtn.style.display = '';
    });

    onlineTab.addEventListener('click', () => {
      onlineTab.classList.add('is-active');
      botTab.classList.remove('is-active');
      onlineContent.style.display = 'block';
      if (opponentSection) opponentSection.style.display = 'none';
      if (botRankSection) botRankSection.style.display = 'none';
      if (startBtn) startBtn.style.display = 'none';
    });

    // Button clicks
    const btnCreate = mpPanel.querySelector('#btn-create-room');
    const btnJoin = mpPanel.querySelector('#btn-join-room');
    const inputCode = mpPanel.querySelector('#input-room-code');

    btnCreate.addEventListener('click', (e) => {
      e.preventDefault();
      createRoom();
    });

    btnJoin.addEventListener('click', (e) => {
      e.preventDefault();
      const code = inputCode.value.trim();
      if (code) joinRoom(code);
    });

    inputCode.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const code = inputCode.value.trim();
        if (code) joinRoom(code);
      }
    });

    // Auto-join from URL parameter ?room=CODE
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
      onlineTab.click();
      inputCode.value = roomFromUrl;
      setTimeout(() => joinRoom(roomFromUrl), 500);
    }
  }

  function updateLobbyUI(state, extra) {
    const statusArea = document.getElementById('mp-status-area');
    if (!statusArea) return;

    if (state === 'connecting') {
      statusArea.innerHTML = `
        <div class="mp-connecting-state">
          <div class="mp-spinner"></div>
          <span>${extra}</span>
        </div>
      `;
    } else if (state === 'waiting') {
      const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${extra}`;
      statusArea.innerHTML = `
        <div class="mp-room-badge">
          <div class="mp-room-title">STANZA PRIVATA ATTIVA</div>
          <div class="mp-room-code">${extra}</div>
          <div class="mp-room-copy-wrap">
            <button type="button" id="btn-copy-link" class="mp-copy-btn">
              📋 Copia Link Invito per Amici
            </button>
          </div>
          <div class="mp-waiting-pulse">
            <span class="radar-dot"></span> In attesa che l'amico entri con codice o link...
          </div>
        </div>
      `;
      const copyBtn = document.getElementById('btn-copy-link');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(inviteUrl).then(() => {
            copyBtn.textContent = '✅ Link Copiato!';
            setTimeout(() => { copyBtn.textContent = '📋 Copia Link Invito per Amici'; }, 2500);
          });
        });
      }
    } else if (state === 'connected') {
      statusArea.innerHTML = `
        <div class="mp-connected-state">
          <div class="mp-connected-badge">🟢 PARTITA ONLINE ATTIVA!</div>
          <div class="mp-connected-sub">Stanza: <strong>${extra}</strong> | Connessione WebRTC P2P Diretta</div>
        </div>
      `;
    } else if (state === 'error') {
      statusArea.innerHTML = `
        <div class="mp-error-state">
          <span>${extra}</span>
          <button type="button" class="mp-retry-btn" onclick="window.__rl_multiplayer && window.__rl_multiplayer.cleanup()">Ricarica Lobby</button>
        </div>
      `;
    } else {
      statusArea.innerHTML = `
        <p class="mp-hint">Crea una stanza privata e condividi il codice con il tuo amico, oppure inserisci il codice che ti ha inviato.</p>
      `;
    }
  }

  function updatePingUI(ms) {
    let pingEl = document.getElementById('rl-ping-indicator');
    if (!pingEl) {
      pingEl = document.createElement('div');
      pingEl.id = 'rl-ping-indicator';
      pingEl.className = 'ping-indicator';
      document.body.appendChild(pingEl);
    }
    if (ms > 0) {
      pingEl.style.display = 'inline-flex';
      const color = ms < 50 ? '#00f0ff' : ms < 100 ? '#ffd700' : '#ff4444';
      pingEl.innerHTML = `<span class="ping-dot" style="background:${color}"></span> PING: ${ms}ms`;
    } else {
      pingEl.style.display = 'none';
    }
  }

  // Global Exports
  window.__rl_multiplayer = {
    createRoom,
    joinRoom,
    cleanup: cleanupMultiplayer,
    triggerQuickChat,
    isOnline: () => isHost || isGuest,
    isHost: () => isHost,
    isGuest: () => isGuest,
    getGuestControls: () => remoteControls
  };

  // Watch for UI injection
  const observer = new MutationObserver(() => {
    injectMultiplayerUI();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(injectMultiplayerUI, 600);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(injectMultiplayerUI, 600);
    });
  }
})();
