import { useEffect, useRef, useState } from 'react';

const defaultSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#7c3aed"/>
        <stop offset="50%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#14b8a6"/>
      </linearGradient>
    </defs>
    <rect width="1400" height="900" fill="url(#bg)"/>
    <circle cx="1120" cy="210" r="210" fill="rgba(255,255,255,0.18)"/>
    <circle cx="350" cy="780" r="260" fill="rgba(255,255,255,0.12)"/>
    <rect x="150" y="180" width="1100" height="540" rx="44" fill="rgba(15,23,42,0.18)" stroke="rgba(255,255,255,0.32)"/>
    <rect x="260" y="270" width="420" height="300" rx="28" fill="rgba(255,255,255,0.18)"/>
    <path d="M830 350 L1010 350 L1160 470 L1010 610 L830 610 L690 470 Z" fill="rgba(255,255,255,0.28)"/>
    <rect x="300" y="610" width="260" height="16" rx="8" fill="rgba(255,255,255,0.7)"/>
    <rect x="300" y="640" width="190" height="16" rx="8" fill="rgba(255,255,255,0.45)"/>
    <text x="300" y="240" fill="white" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="700">Creative launch</text>
  </svg>
`;

const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(defaultSvg)}`;

const presetMap = {
  Natural: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, blur: 0, hue: 0, rotate: 0, flipH: false, flipV: false },
  Warm: { brightness: 110, contrast: 120, saturation: 122, sepia: 16, grayscale: 0, blur: 0, hue: 10, rotate: 0, flipH: false, flipV: false },
  Mono: { brightness: 105, contrast: 115, saturation: 40, sepia: 0, grayscale: 100, blur: 0, hue: 0, rotate: 0, flipH: false, flipV: false },
  Drama: { brightness: 96, contrast: 140, saturation: 140, sepia: 10, grayscale: 0, blur: 1, hue: -10, rotate: 0, flipH: false, flipV: false },
  Dream: { brightness: 110, contrast: 90, saturation: 120, sepia: 24, grayscale: 0, blur: 2, hue: 18, rotate: 0, flipH: false, flipV: false },
  Soft: { brightness: 115, contrast: 90, saturation: 80, sepia: 8, grayscale: 10, blur: 1, hue: 0, rotate: 0, flipH: false, flipV: false },
};

const colorMap = {
  red: '#ef4444',
  blue: '#60a5fa',
  green: '#34d399',
  yellow: '#facc15',
  gold: '#facc15',
  orange: '#fb923c',
  purple: '#a78bfa',
  pink: '#f472b6',
  white: '#f8fafc',
  black: '#0f172a',
  teal: '#2dd4bf',
  gray: '#94a3b8',
  grey: '#94a3b8',
  cyan: '#67e8f9',
  silver: '#cbd5e1',
  rose: '#fda4af',
  lavender: '#c4b5fd',
};

const typeMap = {
  text: ['text', 'label', 'word', 'headline', 'title', 'caption'],
  cloud: ['cloud', 'clouds'],
  flower: ['flower', 'flowers', 'rose', 'blossom', 'petal'],
  heart: ['heart', 'hearts', 'love'],
  circle: ['circle', 'circles', 'orb', 'dot', 'bubble'],
  square: ['square', 'squares', 'box', 'boxes', 'tile', 'tiles'],
  triangle: ['triangle', 'triangles', 'mountain', 'peak'],
  sun: ['sun', 'sunburst', 'sunburst'],
  star: ['star', 'stars', 'sparkle', 'sparkles', 'spark', 'burst'],
};

const locationMap = {
  'top-left': { x: 0.2, y: 0.22 },
  'top-right': { x: 0.8, y: 0.22 },
  'bottom-left': { x: 0.2, y: 0.8 },
  'bottom-right': { x: 0.8, y: 0.8 },
  center: { x: 0.5, y: 0.5 },
  left: { x: 0.22, y: 0.5 },
  right: { x: 0.78, y: 0.5 },
  top: { x: 0.5, y: 0.2 },
  bottom: { x: 0.5, y: 0.8 },
};

const validTypes = Object.keys(typeMap);

function App() {
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(dataUrl);
  const [fileName, setFileName] = useState('creative-launch.png');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [objects, setObjects] = useState([]);
  const [prompt, setPrompt] = useState('Add a realistic blue cloud on the left');
  const [activePreset, setActivePreset] = useState('Natural');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, brightness, contrast, saturation, sepia, grayscale, blur, hue, rotate, flipH, flipV, objects]);

  function drawSoftShadow(ctx, size) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.8, size * 1.15, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawObject(ctx, obj, canvasWidth, canvasHeight) {
    const x = obj.x * canvasWidth;
    const y = obj.y * canvasHeight;
    const size = obj.size;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((obj.rotation * Math.PI) / 180);

    const fill = obj.color || '#facc15';
    const glow = obj.glow || 'rgba(255,255,255,0.45)';

    ctx.fillStyle = fill;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;

    drawSoftShadow(ctx, size);

    switch (obj.type) {
      case 'star': {
        const outer = size;
        const inner = size * 0.45;
        ctx.beginPath();
        for (let i = 0; i < 10; i += 1) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const radius = i % 2 === 0 ? outer : inner;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'heart': {
        ctx.beginPath();
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(size * 0.6, -size * 0.8, size * 1.2, size * 0.22, 0, size * 1.12);
        ctx.bezierCurveTo(-size * 1.2, size * 0.22, -size * 0.6, -size * 0.8, 0, size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'circle': {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'sun': {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 12; i += 1) {
          ctx.save();
          ctx.rotate((Math.PI / 6) * i);
          ctx.fillRect(-size * 0.1, -size * 1.28, size * 0.2, size * 0.7);
          ctx.restore();
        }
        ctx.stroke();
        break;
      }
      case 'cloud': {
        ctx.beginPath();
        ctx.arc(-size * 0.5, size * 0.12, size * 0.52, 0, Math.PI * 2);
        ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
        ctx.arc(size * 0.5, size * 0.12, size * 0.52, 0, Math.PI * 2);
        ctx.quadraticCurveTo(size * 0.8, size * 0.75, 0, size * 0.92);
        ctx.quadraticCurveTo(-size * 0.8, size * 0.75, -size * 0.5, size * 0.12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'flower': {
        for (let i = 0; i < 8; i += 1) {
          ctx.save();
          ctx.rotate((Math.PI / 4) * i);
          ctx.beginPath();
          ctx.ellipse(0, -size * 0.38, size * 0.18, size * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'square': {
        ctx.fillRect(-size * 0.75, -size * 0.75, size * 1.5, size * 1.5);
        ctx.strokeRect(-size * 0.75, -size * 0.75, size * 1.5, size * 1.5);
        break;
      }
      case 'triangle': {
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.05);
        ctx.lineTo(size * 1.05, size * 0.95);
        ctx.lineTo(-size * 1.05, size * 0.95);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'text': {
        ctx.font = `700 ${size}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = fill;
        ctx.strokeStyle = 'rgba(15,23,42,0.35)';
        ctx.lineWidth = 2;
        ctx.strokeText(obj.label || 'Text', 0, 0);
        ctx.fillText(obj.label || 'Text', 0, 0);
        break;
      }
      default:
        break;
    }

    ctx.restore();
  }

  function renderCanvas() {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      const rot = ((rotate % 360) + 360) % 360;
      const isPortrait = rot === 90 || rot === 270;

      const width = isPortrait ? image.height : image.width;
      const height = isPortrait ? image.width : image.height;

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) grayscale(${grayscale}%) blur(${blur}px) hue-rotate(${hue}deg)`;
      ctx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
      ctx.restore();

      objects.forEach((obj) => drawObject(ctx, obj, canvas.width, canvas.height));
    };

    image.src = imageSrc;
  }

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name || 'uploaded-photo.png');
      setImageSrc(String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  function applyPreset(name) {
    const preset = presetMap[name];
    if (!preset) return;

    setActivePreset(name);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setSepia(preset.sepia);
    setGrayscale(preset.grayscale);
    setBlur(preset.blur);
    setHue(preset.hue);
    setRotate(preset.rotate);
    setFlipH(preset.flipH);
    setFlipV(preset.flipV);
  }

  function resetAdjustments() {
    setActivePreset('Natural');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setGrayscale(0);
    setBlur(0);
    setHue(0);
    setRotate(0);
    setFlipH(false);
    setFlipV(false);
  }

  function detectColor(text) {
    const lower = text.toLowerCase();
    const entries = Object.entries(colorMap);
    for (const [name, hex] of entries) {
      if (lower.includes(name)) return hex;
    }
    return '#facc15';
  }

  function detectLocation(text) {
    const lower = text.toLowerCase();
    for (const [name, pos] of Object.entries(locationMap)) {
      if (lower.includes(name)) return pos;
    }
    return { x: 0.8, y: 0.2 };
  }

  function detectSize(text) {
    const lower = text.toLowerCase();
    if (/(tiny|mini|small)/.test(lower)) return 42;
    if (/(large|big|huge|giant|massive)/.test(lower)) return 120;
    if (/(medium|normal)/.test(lower)) return 80;
    if (/(small|tiny)/.test(lower)) return 52;
    if (/(text|label)/.test(lower)) return 46;
    return 72;
  }

  function detectType(text) {
    const lower = text.toLowerCase();

    const matches = validTypes
      .map((type) => ({ type, score: typeMap[type].reduce((best, phrase) => Math.max(best, lower.includes(phrase) ? phrase.length : 0), 0) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    if (matches.length > 0) return matches[0].type;

    if (/(text|label|headline|title|caption)/.test(lower)) return 'text';
    if (/(cloud|clouds)/.test(lower)) return 'cloud';
    if (/(flower|rose|blossom|petal)/.test(lower)) return 'flower';
    if (/(heart|love)/.test(lower)) return 'heart';
    if (/(circle|orb|dot|bubble)/.test(lower)) return 'circle';
    if (/(square|box|tile)/.test(lower)) return 'square';
    if (/(triangle|mountain|peak)/.test(lower)) return 'triangle';
    if (/(sun|sunburst)/.test(lower)) return 'sun';
    return 'star';
  }

  function parseLabel(text, type) {
    if (type !== 'text') return undefined;

    const cleaned = text
      .replace(/^(add|create|place|put|make)/gi, '')
      .replace(/\b(text|label|headline|title|caption)\b/gi, '')
      .replace(/\b(that says|with text|saying)\b/gi, '')
      .trim();

    const phrase = cleaned.match(/(?:say|says|saying|with|that)\s+["“']?([^"“”']+?)["“']?$/i)?.[1] || cleaned;
    return phrase?.trim() || 'Launch';
  }

  function applyAiPrompt() {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const removeMode = /\b(remove|delete|clear|erase)\b/.test(lower);

    if (removeMode) {
      const removalType = detectType(trimmed);

      if (/(all|everything)/.test(lower)) {
        setObjects([]);
        return;
      }

      if (/(last|most recent)/.test(lower)) {
        setObjects((current) => current.slice(0, -1));
        return;
      }

      setObjects((current) => {
        if (!current.length) return current;
        return current.filter((item) => {
          const matches = item.type === removalType || (item.label && item.label.toLowerCase().includes(removalType));
          return !matches;
        });
      });
      return;
    }

    const type = detectType(trimmed);
    const color = detectColor(trimmed);
    const loc = detectLocation(trimmed);
    const size = detectSize(trimmed);
    const labelValue = parseLabel(trimmed, type);

    const newObject = {
      id: Date.now() + Math.random(),
      type,
      color,
      x: loc.x,
      y: loc.y,
      size,
      rotation: 0,
      label: labelValue,
      glow: type === 'star' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)',
    };

    setObjects((current) => [...current, newObject]);
    setPrompt('');
  }

  function clearObjects() {
    setObjects([]);
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = fileName.replace(/\.[^/.]+$/, '') + '-edited.png';
    link.click();
  }

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(fileName);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      console.error('Copy failed');
    }
  }

  return (
    <div className="editor-shell">
      <header className="editor-topbar">
        <div className="brand-wrap">
          <div className="brand-mark">P</div>
          <div>
            <p className="eyebrow">photo editor</p>
            <h1>PixelForge</h1>
          </div>
        </div>

        <div className="top-actions">
          <label className="upload-btn">
            <input type="file" accept="image/*" onChange={handleUpload} />
            Upload photo
          </label>
          <button className="primary-btn" type="button" onClick={downloadImage}>
            Download
          </button>
        </div>
      </header>

      <main className="editor-layout">
        <aside className="sidebar glass-panel">
          <div className="panel-block">
            <p className="small-label">AI prompt</p>
            <textarea
              className="ai-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Add a realistic blue cloud on the left"
            />
            <div className="prompt-actions">
              <button type="button" className="primary-btn prompt-btn" onClick={applyAiPrompt}>
                Add / remove object
              </button>
              <button type="button" className="secondary-btn" onClick={clearObjects}>
                Clear objects
              </button>
            </div>
          </div>

          <div className="panel-block">
            <p className="small-label">Presets</p>
            <div className="preset-grid">
              {Object.keys(presetMap).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-btn ${activePreset === preset ? 'active' : ''}`}
                  onClick={() => applyPreset(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-block">
            <p className="small-label">Quick tune</p>
            <Slider label="Brightness" value={brightness} min={0} max={200} onChange={setBrightness} />
            <Slider label="Contrast" value={contrast} min={0} max={200} onChange={setContrast} />
            <Slider label="Saturation" value={saturation} min={0} max={200} onChange={setSaturation} />
            <Slider label="Sepia" value={sepia} min={0} max={100} onChange={setSepia} />
            <Slider label="Grayscale" value={grayscale} min={0} max={100} onChange={setGrayscale} />
            <Slider label="Blur" value={blur} min={0} max={12} onChange={setBlur} />
            <Slider label="Hue" value={hue} min={-180} max={180} onChange={setHue} />
            <Slider label="Rotate" value={rotate} min={-180} max={180} onChange={setRotate} />
          </div>

          <div className="panel-block">
            <p className="small-label">Transform</p>
            <div className="toggle-row">
              <button type="button" className={`toggle-btn ${flipH ? 'active' : ''}`} onClick={() => setFlipH((prev) => !prev)}>
                Flip horizontal
              </button>
              <button type="button" className={`toggle-btn ${flipV ? 'active' : ''}`} onClick={() => setFlipV((prev) => !prev)}>
                Flip vertical
              </button>
            </div>
            <button type="button" className="reset-btn" onClick={resetAdjustments}>
              Reset all
            </button>
          </div>
        </aside>

        <section className="canvas-panel glass-panel">
          <div className="canvas-toolbar">
            <span className="file-badge">{fileName}</span>
            <div className="toolbar-right">
              <span className="status-pill">Live edit</span>
              <button type="button" className="mini-btn" onClick={copyHtml}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="canvas-stage">
            <canvas ref={canvasRef} />
          </div>
        </section>
      </main>
    </div>
  );
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <label className="slider-wrap">
      <div className="slider-head">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export default App;
