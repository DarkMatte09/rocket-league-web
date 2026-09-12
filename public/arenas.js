/**
 * ROCKET LEAGUE ARENAS — AUTHENTIC STADIUM SYSTEM
 * Implements legitimate Psyonix Rocket League stadiums:
 * - DFH Stadium (Dusk)
 * - Champions Field (Night / RLCS Major)
 * - Mannfield (Clear Daylight)
 * - Utopia Coliseum (Sunset)
 * - Neo Tokyo (Cyberpunk)
 * - Urban Central (Night)
 *
 * Provides instant real-time arena switching without hitching or reloading geometry.
 */

export const ARENAS = {
  dfh_dusk: {
    id: 'dfh_dusk',
    name: 'DFH Stadium (Dusk)',
    badge: 'CLASSIC DUSK',
    sky: {
      zenith: 0x0c2044,
      middle: 0x4768a9,
      horizon: 0xa48c65
    },
    background: 0x4768a9,
    fog: {
      color: 0x6586a5,
      near: 14000,
      far: 34000
    },
    hemiLight: {
      sky: 0xc8e0ff,
      ground: 0x273347,
      intensity: 1.15
    },
    fillLight: {
      color: 0x895667,
      intensity: 0.35
    },
    sun: {
      color: 0xffeedd,
      intensity: 1.0
    },
    turf: {
      darkGrass: [26, 76, 30],
      lightGrass: [32, 84, 36],
      lineColor: 'rgba(225, 238, 218, 0.91)',
      borderColor: 'rgba(135, 171, 104, 0.17)',
      roughness: 0.96
    },
    jumbotron: {
      top: 'ROCKET LEAGUE',
      bottom: 'DFH STADIUM · DUSK',
      topColor: '#ffffff',
      bottomColor: '#ff9922',
      glowTop: '#00f0ff',
      glowBottom: '#ff7700',
      border: 'rgba(0,240,255,0.45)',
      bg: '#040813'
    },
    trimColors: {
      cyan: 0x00f0ff,
      amber: 0xff9922,
      warmLight: 0xffeedd
    }
  },
  champions_field: {
    id: 'champions_field',
    name: 'Champions Field (Night)',
    badge: 'RLCS ESPORTS',
    sky: {
      zenith: 0x020512,
      middle: 0x081530,
      horizon: 0x0c2a54
    },
    background: 0x081530,
    fog: {
      color: 0x050e1f,
      near: 10000,
      far: 30000
    },
    hemiLight: {
      sky: 0x00c8ff,
      ground: 0x020610,
      intensity: 0.95
    },
    fillLight: {
      color: 0x00e5ff,
      intensity: 0.55
    },
    sun: {
      color: 0xdff4ff,
      intensity: 1.25
    },
    turf: {
      darkGrass: [14, 28, 42],
      lightGrass: [18, 35, 52],
      lineColor: 'rgba(180, 240, 255, 0.96)',
      borderColor: 'rgba(0, 180, 255, 0.28)',
      roughness: 0.92
    },
    jumbotron: {
      top: 'RLCS WORLD CHAMPIONSHIP',
      bottom: 'CHAMPIONS FIELD · GRAND FINALS',
      topColor: '#ffffff',
      bottomColor: '#00f0ff',
      glowTop: '#00f0ff',
      glowBottom: '#0088ff',
      border: 'rgba(0,240,255,0.85)',
      bg: '#01050e'
    },
    trimColors: {
      cyan: 0x00ffff,
      amber: 0x0088ff,
      warmLight: 0xd8eeff
    }
  },
  mannfield_day: {
    id: 'mannfield_day',
    name: 'Mannfield (Daylight)',
    badge: 'SUNNY PREMIER',
    sky: {
      zenith: 0x185fb8,
      middle: 0x4f9ee8,
      horizon: 0xc8e2fa
    },
    background: 0x4f9ee8,
    fog: {
      color: 0x8cbce6,
      near: 18000,
      far: 42000
    },
    hemiLight: {
      sky: 0xf0f7ff,
      ground: 0x304820,
      intensity: 1.35
    },
    fillLight: {
      color: 0x90c4ff,
      intensity: 0.4
    },
    sun: {
      color: 0xfff8ee,
      intensity: 1.4
    },
    turf: {
      darkGrass: [36, 96, 32],
      lightGrass: [44, 112, 38],
      lineColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: 'rgba(160, 210, 130, 0.25)',
      roughness: 0.95
    },
    jumbotron: {
      top: 'ROCKET LEAGUE',
      bottom: 'MANNFIELD ARENA · SUNNY PITCH',
      topColor: '#ffffff',
      bottomColor: '#22c55e',
      glowTop: '#22c55e',
      glowBottom: '#eab308',
      border: 'rgba(34,197,94,0.6)',
      bg: '#04100c'
    },
    trimColors: {
      cyan: 0x10b981,
      amber: 0xf59e0b,
      warmLight: 0xfff6e0
    }
  },
  utopia_coliseum: {
    id: 'utopia_coliseum',
    name: 'Utopia Coliseum (Sunset)',
    badge: 'COLOSSEO DUSK',
    sky: {
      zenith: 0x261448,
      middle: 0xa23856,
      horizon: 0xf89240
    },
    background: 0xa23856,
    fog: {
      color: 0x5c1e34,
      near: 12000,
      far: 33000
    },
    hemiLight: {
      sky: 0xffd0a4,
      ground: 0x3b1522,
      intensity: 1.15
    },
    fillLight: {
      color: 0xc8326e,
      intensity: 0.45
    },
    sun: {
      color: 0xffaf5a,
      intensity: 1.3
    },
    turf: {
      darkGrass: [68, 76, 26],
      lightGrass: [78, 86, 32],
      lineColor: 'rgba(255, 245, 222, 0.94)',
      borderColor: 'rgba(215, 160, 80, 0.22)',
      roughness: 0.94
    },
    jumbotron: {
      top: 'UTOPIA COLISEUM',
      bottom: "SERIE D'ORO · GOLDEN SUNSET",
      topColor: '#ffffff',
      bottomColor: '#fbbf24',
      glowTop: '#f59e0b',
      glowBottom: '#ec4899',
      border: 'rgba(245,158,11,0.65)',
      bg: '#14050d'
    },
    trimColors: {
      cyan: 0xd946ef,
      amber: 0xf59e0b,
      warmLight: 0xffa055
    }
  },
  neo_tokyo: {
    id: 'neo_tokyo',
    name: 'Neo Tokyo (Cyberpunk)',
    badge: 'NEON SHINJUKU',
    sky: {
      zenith: 0x020108,
      middle: 0x140728,
      horizon: 0x480854
    },
    background: 0x140728,
    fog: {
      color: 0x180324,
      near: 10000,
      far: 27000
    },
    hemiLight: {
      sky: 0x7c2dff,
      ground: 0x060010,
      intensity: 1.05
    },
    fillLight: {
      color: 0xff0088,
      intensity: 0.65
    },
    sun: {
      color: 0xe6b8ff,
      intensity: 1.2
    },
    turf: {
      darkGrass: [15, 12, 28],
      lightGrass: [22, 18, 38],
      lineColor: 'rgba(255, 45, 150, 0.95)',
      borderColor: 'rgba(0, 240, 255, 0.35)',
      roughness: 0.90
    },
    jumbotron: {
      top: 'NEO TOKYO',
      bottom: 'SHINJUKU CYBER DISTRICT',
      topColor: '#ffffff',
      bottomColor: '#ff007f',
      glowTop: '#ff007f',
      glowBottom: '#00ffff',
      border: 'rgba(255,0,127,0.75)',
      bg: '#080112'
    },
    trimColors: {
      cyan: 0x00ffff,
      amber: 0xff007f,
      warmLight: 0xbf00ff
    }
  },
  urban_central: {
    id: 'urban_central',
    name: 'Urban Central (Night)',
    badge: 'METRO DOWNTOWN',
    sky: {
      zenith: 0x090c10,
      middle: 0x1a212a,
      horizon: 0x363832
    },
    background: 0x1a212a,
    fog: {
      color: 0x14181f,
      near: 12000,
      far: 31000
    },
    hemiLight: {
      sky: 0xd0e0ea,
      ground: 0x16181b,
      intensity: 1.05
    },
    fillLight: {
      color: 0x46687f,
      intensity: 0.4
    },
    sun: {
      color: 0xffdfa8,
      intensity: 1.15
    },
    turf: {
      darkGrass: [30, 38, 34],
      lightGrass: [38, 46, 40],
      lineColor: 'rgba(242, 238, 220, 0.92)',
      borderColor: 'rgba(250, 204, 21, 0.20)',
      roughness: 0.96
    },
    jumbotron: {
      top: 'URBAN CENTRAL',
      bottom: 'METRO STREET ARENA',
      topColor: '#ffffff',
      bottomColor: '#38bdf8',
      glowTop: '#38bdf8',
      glowBottom: '#f97316',
      border: 'rgba(56,189,248,0.65)',
      bg: '#0b1017'
    },
    trimColors: {
      cyan: 0x38bdf8,
      amber: 0xf97316,
      warmLight: 0xffb54a
    }
  }
};

const vi = 8192, ji = 10240, ar = 2048, fi = 2560;

function createPRNG(seed) {
  let e = seed >>> 0;
  return () => {
    e = Math.imul(e, 1664525) + 1013904223 >>> 0;
    return e / 4294967296;
  };
}

export function generateTurfCanvas(turfCfg) {
  const canvas = document.createElement('canvas');
  canvas.width = ar;
  canvas.height = fi;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const t = createPRNG(1296388681);
  const imgData = ctx.createImageData(ar, fi);
  const data = imgData.data;
  const s = new Float32Array(ar);

  const dark = turfCfg?.darkGrass ?? [26, 76, 30];
  const light = turfCfg?.lightGrass ?? [32, 84, 36];
  const lineColor = turfCfg?.lineColor ?? 'rgba(225, 238, 218, 0.91)';
  const borderColor = turfCfg?.borderColor ?? 'rgba(135, 171, 104, 0.17)';

  for (let h = 0; h < ar; h++) {
    s[h] = Math.sin(h * 0.026) * 0.009 + Math.sin(h * 0.0073 + 1.1) * 0.018 + ((Math.floor(h / 160) % 2) * 0.015);
  }

  for (let h = 0; h < fi; h++) {
    const u = (h * ji) / fi - ji / 2;
    const d = Math.floor(h / 160) % 2;
    const p = Math.sin(h * 0.021) * 0.014 + Math.sin(h * 0.0051) * 0.022;
    const j = Math.exp(-Math.pow((Math.abs(u) - 4510) / 390, 2));

    for (let m = 0; m < ar; m++) {
      const g = (m * vi) / ar - vi / 2;
      const C = j * Math.exp(-Math.pow(g / 880, 2));
      const S = Math.abs(g) > 3650 || Math.abs(u) > 4800 ? 0.81 : 1;
      const factor = (0.955 + t() * 0.09 + s[m] + p) * S;
      const w = (h * ar + m) * 4;

      const baseR = d ? light[0] : dark[0];
      const baseG = d ? light[1] : dark[1];
      const baseB = d ? light[2] : dark[2];

      data[w] = (baseR + C * 9) * factor;
      data[w + 1] = (baseG - C * 6) * factor;
      data[w + 2] = (baseB - C * 5) * factor;
      data[w + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  ctx.scale(ar / vi, fi / ji);
  ctx.translate(vi / 2, ji / 2);
  ctx.lineWidth = 18;
  ctx.strokeStyle = lineColor;
  ctx.fillStyle = lineColor;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const line = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const circle = (cx, cy, r, fill = false) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (fill) ctx.fill(); else ctx.stroke();
  };

  const A = 3500, l = 4700;
  ctx.strokeRect(-A, -l, A * 2, l * 2);
  line(-A, 0, A, 0);
  circle(0, 0, 915);
  circle(0, 0, 23, true);

  for (const h of [-1, 1]) {
    const u = h * l;
    const d = h * 3350;
    ctx.beginPath();
    ctx.moveTo(-2000, u); ctx.lineTo(-2000, d); ctx.lineTo(2000, d); ctx.lineTo(2000, u);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-1150, u); ctx.lineTo(-1150, h * 4190); ctx.lineTo(1150, h * 4190); ctx.lineTo(1150, u);
    ctx.stroke();

    circle(0, h * 3760, 20, true);

    ctx.save();
    ctx.beginPath();
    ctx.rect(-1600, h > 0 ? 2000 : -3350, 3200, 1350);
    ctx.clip();
    circle(0, h * 3760, 850);
    ctx.restore();

    for (const p of [-1, 1]) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-A, -l, A * 2, l * 2);
      ctx.clip();
      circle(p * A, u, 105);
      ctx.restore();
    }
  }

  ctx.lineWidth = 7;
  ctx.strokeStyle = borderColor;
  ctx.strokeRect(-3590, -4780, 7180, 9560);

  return canvas;
}

export function drawJumbotron(canvas, ctx, jcfg) {
  if (!ctx || !jcfg) return;
  ctx.save();
  ctx.fillStyle = jcfg.bg || '#040813';
  ctx.fillRect(0, 0, 1024, 256);

  // Outer border
  ctx.strokeStyle = jcfg.border || 'rgba(0,240,255,0.45)';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 1008, 240);

  // Corner tech markers
  ctx.fillStyle = jcfg.glowTop || '#00f0ff';
  ctx.fillRect(8, 8, 32, 6);
  ctx.fillRect(8, 8, 6, 32);
  ctx.fillRect(1024 - 40, 8, 32, 6);
  ctx.fillRect(1024 - 14, 8, 6, 32);
  ctx.fillRect(8, 256 - 14, 32, 6);
  ctx.fillRect(8, 256 - 40, 6, 32);
  ctx.fillRect(1024 - 40, 256 - 14, 32, 6);
  ctx.fillRect(1024 - 14, 256 - 40, 6, 32);

  // Title
  ctx.shadowColor = jcfg.glowTop || '#00f0ff';
  ctx.shadowBlur = 24;
  ctx.font = "900 86px 'Chakra Petch', sans-serif";
  ctx.fillStyle = jcfg.topColor || '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(jcfg.top, 512, 104);

  // Subtitle
  ctx.shadowColor = jcfg.glowBottom || '#ff7700';
  ctx.shadowBlur = 18;
  ctx.font = "bold 32px 'Rajdhani', sans-serif";
  ctx.fillStyle = jcfg.bottomColor || '#ff9922';
  ctx.fillText(jcfg.bottom, 512, 186);

  // Lateral accent lines
  ctx.shadowBlur = 0;
  ctx.strokeStyle = jcfg.border || 'rgba(0,240,255,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 204); ctx.lineTo(340, 204);
  ctx.moveTo(1024 - 90, 204); ctx.lineTo(1024 - 340, 204);
  ctx.stroke();

  ctx.restore();
}

export function setArena(arenaId) {
  const cfg = ARENAS[arenaId] || ARENAS.dfh_dusk;
  const sm = window.__rl_sceneManager;
  if (!sm) {
    console.warn('Scene manager not ready yet for setArena', arenaId);
    localStorage.setItem('car-soccer.arena', cfg.id);
    return;
  }

  // 1. Sky
  if (sm.sky && sm.sky.material && sm.sky.material.uniforms) {
    const u = sm.sky.material.uniforms;
    if (u.zenith && u.zenith.value) u.zenith.value.setHex(cfg.sky.zenith);
    if (u.middle && u.middle.value) u.middle.value.setHex(cfg.sky.middle);
    if (u.horizon && u.horizon.value) u.horizon.value.setHex(cfg.sky.horizon);
  }

  // 2. Scene Background & Fog
  if (sm.scene) {
    if (sm.scene.background && typeof sm.scene.background.setHex === 'function') {
      sm.scene.background.setHex(cfg.background);
    }
    if (sm.scene.fog) {
      sm.scene.fog.color.setHex(cfg.fog.color);
      sm.scene.fog.near = cfg.fog.near;
      sm.scene.fog.far = cfg.fog.far;
    }
  }

  // 3. Lighting
  if (sm.hemiLight) {
    sm.hemiLight.color.setHex(cfg.hemiLight.sky);
    sm.hemiLight.groundColor.setHex(cfg.hemiLight.ground);
    sm.hemiLight.intensity = cfg.hemiLight.intensity;
  }
  if (sm.fillLight) {
    sm.fillLight.color.setHex(cfg.fillLight.color);
    sm.fillLight.intensity = cfg.fillLight.intensity;
  }
  if (sm.carSun) {
    sm.carSun.color.setHex(cfg.sun.color);
    sm.carSun.intensity = cfg.sun.intensity;
  }
  if (sm.ballSun) {
    sm.ballSun.color.setHex(cfg.sun.color);
    sm.ballSun.intensity = cfg.sun.intensity;
  }
  if (sm.opponentSun && sm.opponentSun.visible) {
    sm.opponentSun.color.setHex(cfg.sun.color);
  }

  // 4. Turf Regeneration & Pad stamps
  try {
    const turfData = sm.turf?.userData?.turfData || window.__rl_turfData;
    if (turfData) {
      const newCanvas = generateTurfCanvas(cfg.turf);
      turfData.base = newCanvas;
      if (turfData.texture) {
        turfData.texture.image = newCanvas;
        turfData.texture.needsUpdate = true;
      }
      if (window.__rl_sim && typeof window.__rl_Ob === 'function') {
        window.__rl_Ob(sm.turf, window.__rl_sim.getPads());
      }
    }
  } catch (err) {
    console.warn('Turf texture update error:', err);
  }

  // 5. Jumbotron Redraw
  try {
    const j = sm.stadium?.userData?.jumbotron;
    if (j && j.canvas && j.context && j.texture) {
      drawJumbotron(j.canvas, j.context, cfg.jumbotron);
      j.texture.needsUpdate = true;
    }
  } catch (err) {
    console.warn('Jumbotron update error:', err);
  }

  // 6. Stadium Structure Trim Colors
  try {
    if (sm.stadium && cfg.trimColors) {
      sm.stadium.traverse(obj => {
        if (!obj.material) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          if (!m.name) continue;
          if (m.name.includes('Cyan') && typeof m.color?.setHex === 'function') {
            m.color.setHex(cfg.trimColors.cyan);
          } else if (m.name.includes('Amber') && typeof m.color?.setHex === 'function') {
            m.color.setHex(cfg.trimColors.amber);
          } else if (m.name.includes('Warm light') && typeof m.color?.setHex === 'function') {
            m.color.setHex(cfg.trimColors.warmLight);
          }
        }
      });
    }
  } catch (err) {
    console.warn('Stadium trim update error:', err);
  }

  sm.currentArenaId = cfg.id;
  if (typeof sm.markRenderTreeChanged === 'function') {
    sm.markRenderTreeChanged();
  }

  localStorage.setItem('car-soccer.arena', cfg.id);
  window.dispatchEvent(new CustomEvent('rl-arena-changed', { detail: cfg }));
}

// Global exposure
window.__rl_arenas = ARENAS;
window.__rl_generateTurfCanvas = generateTurfCanvas;
window.__rl_drawJumbotron = drawJumbotron;
window.__rl_setArena = setArena;
