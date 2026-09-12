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
  let roomCode = null;
  let remoteControls = { throttle: 0, steer: 0, pitch: 0, yaw: 0, roll: 0, jump: false, boost: false, handbrake: false };
  let ping = 0;
  let lastPingTime = 0;
  let stateSendInterval = null;
  let pingInterval = null;

  // Quick Chat Messages
  const QUICK_CHATS = {
    1: '🎯 Bel tiro!',
    2: '🛡️ Bella parata!',
    3: '🚀 Grande passaggio!',
    4: '💥 Oops!'
  };

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'RL-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function getPeerIdForRoom(code) {
    return `rlw-room-${code.toUpperCase().trim()}`;
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

  // Create Private Room (Host)
  function createRoom() {
    if (peer) peer.destroy();

    roomCode = generateRoomCode();
    const peerId = getPeerIdForRoom(roomCode);
    isHost = true;
    isGuest = false;

    updateLobbyUI('connecting', `Creazione stanza ${roomCode}...`);

    try {
      peer = new window.Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('open', (id) => {
        updateLobbyUI('waiting', roomCode);
        showToast('Stanza Creata!', `Codice: ${roomCode}. Invia il link al tuo amico.`, 'success');
      });

      peer.on('connection', (conn) => {
        connection = conn;
        setupConnectionHandlers(conn);
      });

      peer.on('error', (err) => {
        console.warn('PeerJS Host Error:', err);
        if (err.type === 'unavailable-id') {
          // Retry with new code if collision
          setTimeout(createRoom, 300);
        } else {
          updateLobbyUI('error', `Errore connessione: ${err.message || err.type}`);
        }
      });
    } catch (e) {
      updateLobbyUI('error', `Errore WebRTC: ${e.message}`);
    }
  }

  // Join Private Room (Guest)
  function joinRoom(code) {
    if (!code) return;
    if (peer) peer.destroy();

    roomCode = code.toUpperCase().trim();
    const hostPeerId = getPeerIdForRoom(roomCode);
    isHost = false;
    isGuest = true;

    updateLobbyUI('connecting', `Connessione alla stanza ${roomCode}...`);

    try {
      peer = new window.Peer({
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('open', () => {
        const conn = peer.connect(hostPeerId, {
          reliable: false,
          serialization: 'json'
        });
        connection = conn;
        setupConnectionHandlers(conn);
      });

      peer.on('error', (err) => {
        console.warn('PeerJS Guest Error:', err);
        updateLobbyUI('error', `Impossibile trovare la stanza ${roomCode}. Verifica il codice.`);
      });
    } catch (e) {
      updateLobbyUI('error', `Errore WebRTC: ${e.message}`);
    }
  }

  function setupConnectionHandlers(conn) {
    conn.on('open', () => {
      updateLobbyUI('connected', roomCode);
      showToast('Amico Connesso!', 'La partita online 1v1 è pronta!', 'success');

      // Start ping loop
      clearInterval(pingInterval);
      pingInterval = setInterval(() => {
        if (conn && conn.open) {
          lastPingTime = performance.now();
          conn.send({ type: 'ping', t: lastPingTime });
        }
      }, 1000);

      // If Host, start match physics broadcasting
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
      showToast('Disconnesso', 'L\'amico si è disconnesso dalla partita.', 'warning');
      cleanupMultiplayer();
    });

    conn.on('error', (err) => {
      console.warn('DataChannel Error:', err);
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
      ping = Math.round(performance.now() - data.t);
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

    if (data.type === 'match_event') {
      if (data.event === 'start') {
        showToast('Partita Iniziata!', 'Kickoff!', 'success');
      }
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

      // Extract ball (indices in state: ball is typically at offset 0-18)
      // and cars (car 0 and car 1)
      const snapshot = {
        type: 'state',
        scoreBlue: match ? match.state.blueScore : 0,
        scoreOrange: match ? match.state.orangeScore : 0,
        time: match ? match.state.remainingSeconds : 300,
        phase: match ? match.state.phase : 'playing',
        // Raw state slice (first 100 floats contains ball, cars, etc.)
        simState: Array.from(state.subarray(0, 120))
      };

      connection.send(snapshot);
    }, 22);
  }

  function startGuestMatch() {
    const sim = window.__rl_sim;
    const sceneManager = window.__rl_sceneManager;
    const matchUI = window.__rl_matchUI;

    if (matchUI) matchUI.hide();

    // Guest input sending loop (60Hz)
    clearInterval(stateSendInterval);
    stateSendInterval = setInterval(() => {
      if (!connection || !connection.open) return;

      // Read local player controls
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
    roomCode = null;
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
              <input type="text" id="input-room-code" class="mp-input" placeholder="Codice (es. RL-8492)" maxlength="8" />
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
          <div class="mp-room-title">STANZA PRIVATA CREATA</div>
          <div class="mp-room-code">${extra}</div>
          <div class="mp-room-copy-wrap">
            <button type="button" id="btn-copy-link" class="mp-copy-btn">
              📋 Copia Link Invito per Amici
            </button>
          </div>
          <div class="mp-waiting-pulse">
            <span class="radar-dot"></span> In attesa che l'amico entri con il codice o link...
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
          <div class="mp-connected-badge">🟢 PARTITA 1v1 CONNESSA!</div>
          <div class="mp-connected-sub">Stanza: <strong>${extra}</strong> | Latenza WebRTC attiva</div>
        </div>
      `;
    } else if (state === 'error') {
      statusArea.innerHTML = `
        <div class="mp-error-state">
          <span>⚠️ ${extra}</span>
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
