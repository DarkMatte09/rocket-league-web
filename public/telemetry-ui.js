/**
 * ROCKET LEAGUE WEB — TELEMETRY & TASTE-SKILL HUD OVERLAY
 * Connects directly to RocketSim physics state for live speedometer,
 * training drills, gamepad detection, and tactile feedback.
 */

(function initTasteUI() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

  function setup() {
    createTopHUD();
    createGoalBanner();
    createToast();
    setupHotkeys();
    setupGamepadListener();
    setupArenaSelector();
    setupSettingsArenaInjection();
    startTelemetryLoop();
  }

  function createTopHUD() {
    const hud = document.createElement('div');
    hud.id = 'rl-top-hud';
    hud.innerHTML = `
      <!-- Left: Car Speedometer & Telemetry -->
      <div class="liquid-dock telemetry-speed-card" id="speed-card">
        <div class="speed-dial-wrap">
          <svg class="speed-svg-ring" viewBox="0 0 44 44">
            <circle class="speed-ring-bg" cx="22" cy="22" r="18" fill="none"></circle>
            <circle class="speed-ring-bar" id="speed-ring-bar" cx="22" cy="22" r="18" fill="none"
              stroke-dasharray="113.1" stroke-dashoffset="113.1"></circle>
          </svg>
          <svg class="speed-icon-center" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5v-3.8l2.9 1.7.8-1.4-3.7-2.1V6h-2v5.9L7.3 9.8l-.8 1.4 3.7 2.1v3.8l-2.4 1.4.8 1.4 2.4-1.4v2.9h2v-2.9l2.4 1.4.8-1.4-2.4-1.4z"/>
          </svg>
        </div>
        <div class="speed-numbers">
          <div class="speed-val-wrap">
            <span class="speed-value" id="speed-val">0</span>
            <span class="speed-unit">KM/H</span>
          </div>
          <div class="speed-status-sub" id="speed-sub">
            <span class="speed-status-dot"></span>
            <span id="speed-status-text">GROUNDED</span>
          </div>
        </div>

        <!-- Real FPS Module -->
        <div class="telemetry-divider" aria-hidden="true"></div>
        <div class="fps-numbers">
          <div class="fps-val-wrap">
            <span class="fps-value" id="fps-val">60</span>
            <span class="fps-unit">FPS</span>
          </div>
          <div class="fps-status-sub" id="fps-sub">
            <span class="fps-status-dot"></span>
            <span id="fps-status-text">STABLE</span>
          </div>
        </div>
      </div>

      <!-- Center: Freeplay Quick-Action Pills -->
      <div class="liquid-dock training-dock">
        <div class="training-title-badge">
          <span>FREEPLAY</span>
        </div>
        <button class="training-pill-btn" id="btn-reset" title="Reset Kickoff (R)">
          <span class="key-glyph">R</span> Reset
        </button>
        <button class="training-pill-btn" id="btn-possession" title="Catch ball on car roof (1)">
          <span class="key-glyph">1</span> Catch
        </button>
        <button class="training-pill-btn" id="btn-dribble" title="Start dribble (2)">
          <span class="key-glyph">2</span> Dribble
        </button>
        <button class="training-pill-btn" id="btn-pass" title="Pass towards car (3)">
          <span class="key-glyph">3</span> Pass
        </button>
        <button class="training-pill-btn" id="btn-launch" title="Launch pop shot (4)">
          <span class="key-glyph">4</span> Aerial
        </button>
      </div>

      <!-- Center-Right: Arena Stadium Selector -->
      <div class="liquid-dock arena-dock" id="arena-dock">
        <div class="arena-icon-wrap" title="Rocket League Official Stadium">
          <svg class="arena-svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="arena-content-wrap">
          <span class="arena-tag">STADIUM</span>
          <select id="arena-selector" class="arena-dropdown" aria-label="Select Rocket League Arena">
            <option value="dfh_dusk">DFH Stadium (Dusk)</option>
            <option value="champions_field">Champions Field (Night)</option>
            <option value="mannfield_day">Mannfield (Daylight)</option>
            <option value="utopia_coliseum">Utopia Coliseum (Sunset)</option>
            <option value="neo_tokyo">Neo Tokyo (Cyberpunk)</option>
            <option value="urban_central">Urban Central (Night)</option>
          </select>
        </div>
      </div>

      <!-- Right: Gamepad & Keyboard Mode -->
      <div class="liquid-dock system-dock">
        <div class="pad-status-badge" id="pad-badge">
          <svg class="pad-icon" viewBox="0 0 24 24">
            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <span id="pad-text">KEYBOARD & MOUSE</span>
        </div>
      </div>
    `;

    document.body.appendChild(hud);

    document.getElementById('btn-reset').addEventListener('click', () => triggerAction('reset'));
    document.getElementById('btn-possession').addEventListener('click', () => triggerAction('possession'));
    document.getElementById('btn-dribble').addEventListener('click', () => triggerAction('dribble'));
    document.getElementById('btn-pass').addEventListener('click', () => triggerAction('pass'));
    document.getElementById('btn-launch').addEventListener('click', () => triggerAction('launch'));
  }

  function createGoalBanner() {
    const banner = document.createElement('div');
    banner.id = 'rl-goal-banner';
    banner.innerHTML = `
      <h1 class="goal-title">GOAL!</h1>
      <div class="goal-speed" id="goal-speed-val">104 KM/H</div>
    `;
    document.body.appendChild(banner);
  }

  function createToast() {
    const toast = document.createElement('div');
    toast.id = 'rl-toast';
    toast.textContent = 'FREEPLAY READY';
    document.body.appendChild(toast);
  }

  function showToast(msg) {
    const toast = document.getElementById('rl-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function triggerAction(action) {
    const sim = window.__rl_sim;
    if (!sim) {
      showToast('WAITING FOR SIMULATION...');
      return;
    }

    if (action === 'reset') {
      sim.resetKickoff();
      showToast('KICKOFF RESET');
    } else if (action === 'possession') {
      sim.controlBall(0, 'takePossession');
      showToast('BALL IN POSSESSION');
    } else if (action === 'dribble') {
      sim.controlBall(0, 'startDribble');
      showToast('DRIBBLE SETUP');
    } else if (action === 'pass') {
      sim.controlBall(0, 'passBall');
      showToast('BALL PASSED');
    } else if (action === 'launch') {
      sim.controlBall(0, 'launchBall');
      showToast('AERIAL POP SHOT');
    }
  }

  function setupHotkeys() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'r' || e.key === 'R') {
        triggerAction('reset');
      } else if (e.key === '1') {
        triggerAction('possession');
      } else if (e.key === '2') {
        triggerAction('dribble');
      } else if (e.key === '3') {
        triggerAction('pass');
      } else if (e.key === '4') {
        triggerAction('launch');
      }
    });
  }

  function setupGamepadListener() {
    const badge = document.getElementById('pad-badge');
    const text = document.getElementById('pad-text');

    function checkGamepads() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      let activePad = null;
      for (const p of pads) {
        if (p && p.connected) {
          activePad = p;
          break;
        }
      }

      if (activePad) {
        badge.classList.add('connected');
        const idLower = activePad.id.toLowerCase();
        const name = idLower.includes('xbox') ? 'XBOX CONTROLLER'
          : idLower.includes('dualsense') || idLower.includes('sony') || idLower.includes('wireless controller') ? 'PLAYSTATION CONTROLLER'
          : 'GAMEPAD CONNECTED';
        text.textContent = name;
      } else {
        badge.classList.remove('connected');
        text.textContent = 'KEYBOARD & MOUSE';
      }
    }

    window.addEventListener('gamepadconnected', (e) => {
      showToast(`CONTROLLER CONNECTED: ${e.gamepad.id.slice(0, 20)}`);
      checkGamepads();
    });

    window.addEventListener('gamepaddisconnected', () => {
      showToast('CONTROLLER DISCONNECTED');
      checkGamepads();
    });

    setInterval(checkGamepads, 1000);
  }

  function setupArenaSelector() {
    const sel = document.getElementById('arena-selector');
    if (!sel) return;

    const current = localStorage.getItem('car-soccer.arena') || 'dfh_dusk';
    sel.value = current;

    sel.addEventListener('change', (e) => {
      const arenaId = e.target.value;
      if (window.__rl_setArena) {
        window.__rl_setArena(arenaId);
      }
      const arenaName = sel.options[sel.selectedIndex]?.text || arenaId;
      showToast(`ARENA: ${arenaName.toUpperCase()}`);

      const modalSel = document.getElementById('settings-arena-select');
      if (modalSel && modalSel.value !== arenaId) {
        modalSel.value = arenaId;
      }
    });

    window.addEventListener('rl-arena-changed', (e) => {
      if (e.detail?.id && sel.value !== e.detail.id) {
        sel.value = e.detail.id;
      }
    });
  }

  function setupSettingsArenaInjection() {
    const observer = new MutationObserver(() => {
      const sceneryRows = document.querySelector('#settings-panel-graphics .zone:nth-of-type(2) .zone__rows');
      if (sceneryRows && !document.getElementById('settings-arena-select-row')) {
        const row = document.createElement('div');
        row.className = 'dim';
        row.id = 'settings-arena-select-row';
        row.setAttribute('data-dim-row', 'arenaSelector');
        row.innerHTML = `
          <label class="dim__label" for="settings-arena-select">Stadium Arena</label>
          <span class="dim__leader" aria-hidden="true"></span>
          <span class="dim__control">
            <select id="settings-arena-select" class="sheet-select arena-sheet-select">
              <option value="dfh_dusk">DFH Stadium (Dusk)</option>
              <option value="champions_field">Champions Field (Night)</option>
              <option value="mannfield_day">Mannfield (Daylight)</option>
              <option value="utopia_coliseum">Utopia Coliseum (Sunset)</option>
              <option value="neo_tokyo">Neo Tokyo (Cyberpunk)</option>
              <option value="urban_central">Urban Central (Night)</option>
            </select>
          </span>
        `;
        sceneryRows.appendChild(row);

        const sel = document.getElementById('settings-arena-select');
        const current = localStorage.getItem('car-soccer.arena') || 'dfh_dusk';
        sel.value = current;

        sel.addEventListener('change', (e) => {
          const arenaId = e.target.value;
          if (window.__rl_setArena) {
            window.__rl_setArena(arenaId);
          }
          const topSel = document.getElementById('arena-selector');
          if (topSel && topSel.value !== arenaId) topSel.value = arenaId;
          showToast(`ARENA: ${sel.options[sel.selectedIndex]?.text.toUpperCase()}`);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function startTelemetryLoop() {
    const speedVal = document.getElementById('speed-val');
    const speedCard = document.getElementById('speed-card');
    const speedRing = document.getElementById('speed-ring-bar');
    const speedSub = document.getElementById('speed-status-text');
    const fpsVal = document.getElementById('fps-val');
    const fpsSub = document.getElementById('fps-status-text');
    const fpsDot = document.querySelector('.fps-status-dot');
    const circumference = 2 * Math.PI * 18; // ~113.1

    let prevSpeed = 0;
    let goalCooldown = 0;
    let frameDeltas = [];
    let lastFrameTime = performance.now();
    let lastFpsUpdate = performance.now();

    function frame() {
      requestAnimationFrame(frame);

      // Real-time FPS calculation from frame time deltas
      const now = performance.now();
      const dt = now - lastFrameTime;
      lastFrameTime = now;

      if (dt > 0 && dt < 250) {
        frameDeltas.push(dt);
        if (frameDeltas.length > 25) frameDeltas.shift();
      }

      if (now - lastFpsUpdate >= 280 && frameDeltas.length > 0) {
        lastFpsUpdate = now;
        const avgDt = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
        const currentFps = Math.min(360, Math.round(1000 / avgDt));

        if (fpsVal && currentFps > 0) {
          fpsVal.textContent = String(currentFps);
          if (currentFps >= 50) {
            fpsVal.style.color = '#fff';
            if (fpsDot) fpsDot.style.background = '#00f0ff';
            if (fpsSub) fpsSub.textContent = 'STABLE';
          } else if (currentFps >= 28) {
            fpsVal.style.color = '#ffd000';
            if (fpsDot) fpsDot.style.background = '#ffd000';
            if (fpsSub) fpsSub.textContent = 'DROPS';
          } else {
            fpsVal.style.color = '#ff4455';
            if (fpsDot) fpsDot.style.background = '#ff4455';
            if (fpsSub) fpsSub.textContent = 'LOW';
          }
        }
      }

      const sim = window.__rl_sim;
      if (!sim || !sim.module || !sim.state) return;

      const state = sim.state;
      const carBase = 22;

      const vx = state[carBase + 12] || 0;
      const vy = state[carBase + 13] || 0;
      const vz = state[carBase + 14] || 0;

      const uuSpeed = Math.hypot(vx, vy, vz) || 0; // uu/s
      const kmh = Math.round(uuSpeed * 0.036); // 2300 uu/s ~= 82.8 km/h

      if (!isNaN(kmh)) {
        const displaySpeed = Math.round(prevSpeed * 0.7 + kmh * 0.3);
        prevSpeed = displaySpeed;

        speedVal.textContent = String(displaySpeed);

        const ratio = Math.min(1, displaySpeed / 83);
        const offset = circumference * (1 - ratio);
        speedRing.style.strokeDashoffset = String(offset);

        const isSupersonic = state[carBase + 20] === 1 || displaySpeed >= 79;
        const onGround = state[carBase + 19] === 1;

        if (isSupersonic) {
          speedCard.classList.add('is-supersonic');
          speedSub.textContent = 'SUPERSONIC';
        } else {
          speedCard.classList.remove('is-supersonic');
          speedSub.textContent = onGround ? 'GROUNDED' : 'AIRBORNE';
        }
      }

      // Sync boost HUD styling
      const boostCard = document.querySelector('#app .boost');
      const isBoosting = state[carBase + 23] === 1;
      if (boostCard) {
        if (isBoosting) boostCard.classList.add('is-boosting');
        else boostCard.classList.remove('is-boosting');
      }

      // Sync ball cam badge styling
      const ballCamEl = document.querySelector('#app .ball-cam-indicator');
      const cam = window.__rl_camera;
      if (ballCamEl && cam) {
        if (cam.ballCam) {
          ballCamEl.classList.remove('is-car-cam');
          ballCamEl.textContent = 'BALL CAM';
        } else {
          ballCamEl.classList.add('is-car-cam');
          ballCamEl.textContent = 'CAR CAM';
        }
      }

      // Check Goal celebration
      const goal = sim.pollGoal ? sim.pollGoal() : 0;
      const banner = document.getElementById('rl-goal-banner');
      const goalSpeedVal = document.getElementById('goal-speed-val');

      if (goal !== 0 && goalCooldown <= 0) {
        goalCooldown = 180;
        const bvx = state[4 + 12] || 0;
        const bvy = state[4 + 13] || 0;
        const bvz = state[4 + 14] || 0;
        const ballKmh = Math.round(Math.hypot(bvx, bvy, bvz) * 0.036);
        goalSpeedVal.textContent = `${ballKmh} KM/H`;
        banner.classList.add('show');
        setTimeout(() => banner.classList.remove('show'), 2000);
      } else if (goalCooldown > 0) {
        goalCooldown--;
      }
    }

    requestAnimationFrame(frame);
  }
})();
