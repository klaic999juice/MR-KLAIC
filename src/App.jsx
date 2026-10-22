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
};

const typeMap = {
  star: ['star', 'sparkle', 'spark', 'burst'],
  heart: ['heart', 'love'],
  circle: ['circle', 'orb', 'dot', 'bubble'],
  cloud: ['cloud', 'clouds'],
  flower: ['flower', 'rose', 'blossom'],
  square: ['square', 'box', 'tile'],
  triangle: ['triangle', 'mountain'],
  sun: ['sun', 'sunburst'],
  text: ['text', 'label', 'word', 'headline'],
};

const locationMap = {
  'top-left': { x: 0.22, y: 0.24 },
  'top-right': { x: 0.82, y: 0.24 },
  'bottom-left': { x: 0.2, y: 0.8 },
  'bottom-right': { x: 0.8, y: 0.8 },
  center: { x: 0.5, y: 0.5 },
  left: { x: 0.25, y: 0.5 },
  right: { x: 0.75, y: 0.5 },
  top: { x: 0.5, y: 0.25 },
  bottom: { x: 0.5, y: 0.75 },
};

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
  const [prompt, setPrompt] = useState('Add a golden star in the top-right');
  const [activePreset, setActivePreset] = useState('Natural');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, brightness, contrast, saturation, sepia, grayscale, blur, hue, rotate, flipH, flipV, objects]);

  function drawObject(ctx, obj, canvasWidth, canvasHeight) {
    const x = obj.x * canvasWidth;
    const y = obj.y * canvasHeight;
    const size = obj.size;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((obj.rotation * Math.PI) / 180);

    const fill = obj.color || '#facc15';
    ctx.fillStyle = fill;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;

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
        break;
      }
      case 'heart': {
        ctx.beginPath();
        ctx.moveTo(0, size * 0.35);
        ctx.bezierCurveTo(size * 0.55, -size * 0.7, size * 1.2, size * 0.2, 0, size * 1.1);
        ctx.bezierCurveTo(-size * 1.2, size * 0.2, -size * 0.55, -size * 0.7, 0, size * 0.35);
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
          const angle = (Math.PI / 6) * i;
          ctx.save();
          ctx.rotate(angle);
          ctx.fillRect(0, -size * 1.2, size * 0.18, size * 0.7);
          ctx.restore();
        }
        ctx.stroke();
        break;
      }
      case 'cloud': {
        ctx.beginPath();
        ctx.arc(-size * 0.5, size * 0.15, size * 0.5, 0, Math.PI * 2);
        ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
        ctx.arc(size * 0.5, size * 0.15, size * 0.5, 0, Math.PI * 2);
        ctx.quadraticCurveTo(size * 0.8, size * 0.7, 0, size * 0.9);
        ctx.quadraticCurveTo(-size * 0.8, size * 0.7, -size * 0.5, size * 0.15);
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
          ctx.ellipse(0, -size * 0.4, size * 0.18, size * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
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
        ctx.moveTo(0, -size * 1.1);
        ctx.lineTo(size * 1.05, size * 0.95);
        ctx.lineTo(-size * 1.05, size * 0.95);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'text': {
        ctx.font = `700 ${size}px Inter, sans-serif`;
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
    for (const [name, hex] of Object.entries(colorMap)) {
      if (lower.includes(name)) return hex;
    }
    return '#facc15';
  }

  function detectType(text) {
    const lower = text.toLowerCase();
    for (const [type, matches] of Object.entries(typeMap)) {
      if (matches.some((match) => lower.includes(match))) return type;
    }
    return 'star';
  }

  function detectLocation(text) {
    const lower = text.toLowerCase();
    for (const [name, pos] of Object.entries(locationMap)) {
      if (lower.includes(name)) return pos;
    }
    return { x: 0.8, y: 0.2 };
  }

  function applyAiPrompt() {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const removeMode = lower.startsWith('remove') || lower.startsWith('delete') || lower.includes('remove') || lower.includes('delete');

    if (removeMode) {
      const removalType = detectType(trimmed.replace(/remove|delete|the|a|an/g, ' '));

      if (lower.includes('all') || lower.includes('everything')) {
        setObjects([]);
        return;
      }

      if (lower.includes('last')) {
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
    const labelValue = type === 'text' ? (trimmed.replace(/^(add|create|place|put)\s+/i, '').trim() || 'Text') : undefined;

    const newObject = {
      id: Date.now() + Math.random(),
      type,
      color,
      x: loc.x,
      y: loc.y,
      size: type === 'text' ? 36 : 72,
      rotation: 0,
      label: labelValue,
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
              placeholder="Example: Add a gold star in the top-right"
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
