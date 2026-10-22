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
  Soft: { brightness: 115, contrast: 90, saturation: 80, sepia: 8, grayscale: 10, blur: 1, hue: 0, rotate: 0, flipH: false, flipV: false }
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
  const [activePreset, setActivePreset] = useState('Natural');

  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, brightness, contrast, saturation, sepia, grayscale, blur, hue, rotate, flipH, flipV]);

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

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = fileName.replace(/\.[^/.]+$/, '') + '-edited.png';
    link.click();
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
            <span className="status-pill">Live edit</span>
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
