import { useEffect, useState } from 'react';

const defaultMarkup = `<section class="hero">
  <span class="eyebrow-tag">Launch faster</span>
  <h1>Build products that feel premium from day one.</h1>
  <p>
    Turn your next idea into a polished digital experience with a messaging system,
    conversion-focused design, and a launch-ready website that looks premium.
  </p>
  <div class="cta-row">
    <a class="button" href="#">Start free</a>
    <a class="button-secondary" href="#">Book demo</a>
  </div>
</section>

<div class="stats">
  <div class="stat-card">
    <strong>4.9/5</strong>
    <span>Average rating</span>
  </div>
  <div class="stat-card">
    <strong>2.4x</strong>
    <span>Faster launches</span>
  </div>
  <div class="stat-card">
    <strong>12k+</strong>
    <span>Teams using it</span>
  </div>
</div>

<div class="feature-strip">
  <div class="feature">
    <div class="badge">A</div>
    <h3>Audience clarity</h3>
    <p>Shape your message around the problems your product solves best.</p>
  </div>
  <div class="feature">
    <div class="badge">B</div>
    <h3>Design speed</h3>
    <p>Ship more polished experiences without starting from a blank page.</p>
  </div>
  <div class="feature">
    <div class="badge">C</div>
    <h3>Conversion focus</h3>
    <p>Guide visitors toward action with clear, clean calls to action.</p>
  </div>
</div>`;

function App() {
  const [markup, setMarkup] = useState(() => {
    const saved = localStorage.getItem('novaStudioState');
    if (!saved) return defaultMarkup;
    try {
      return JSON.parse(saved).markup || defaultMarkup;
    } catch {
      return defaultMarkup;
    }
  });

  const [title, setTitle] = useState(() => {
    const saved = localStorage.getItem('novaStudioState');
    if (!saved) return 'Build launches people remember';
    try {
      return JSON.parse(saved).title || 'Build launches people remember';
    } catch {
      return 'Build launches people remember';
    }
  });

  const [accent, setAccent] = useState(() => {
    const saved = localStorage.getItem('novaStudioState');
    if (!saved) return '#7c3aed';
    try {
      return JSON.parse(saved).accent || '#7c3aed';
    } catch {
      return '#7c3aed';
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('novaStudioState');
    if (!saved) return false;
    try {
      return Boolean(JSON.parse(saved).isDark);
    } catch {
      return false;
    }
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const payload = JSON.stringify({ title, accent, isDark: darkMode, markup });
    localStorage.setItem('novaStudioState', payload);
  }, [title, accent, darkMode, markup]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-strong', darkenColor(accent));
  }, [accent]);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    document.title = title.trim() || 'Nova Studio';
  }, [darkMode, title]);

  function darkenColor(hex) {
    const normalized = hex.replace('#', '');
    const value = Number.parseInt(normalized, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    const darken = (channel) => Math.max(0, Math.round(channel * 0.8));
    return `#${[darken(r), darken(g), darken(b)]
      .map((channel) => channel.toString(16).padStart(2, '0'))
      .join('')}`;
  }

  function resetEditor() {
    setMarkup(defaultMarkup);
    setTitle('Build launches people remember');
    setAccent('#7c3aed');
    setDarkMode(false);
  }

  function applyChanges() {
    document.title = title.trim() || 'Nova Studio';
  }

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(markup);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      console.error('Copy failed');
    }
  }

  function downloadHtml() {
    const blob = new Blob([markup], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(title || 'page').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-shell">
      <header className="topbar glass-panel">
        <div className="brand-wrap">
          <div className="brand-mark">N</div>
          <div className="brand-copy">
            <p className="eyebrow">website editor</p>
            <h1>Nova Studio</h1>
          </div>
        </div>

        <nav className="topnav" aria-label="Main navigation">
          <span className="nav-pill active">Designer</span>
          <span className="nav-pill">Templates</span>
          <span className="nav-pill">Exports</span>
        </nav>

        <div className="toolbar">
          <label className="field-inline" aria-label="Page title input">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" />
          </label>

          <label className="field-inline color-field" aria-label="Accent color picker">
            <span>Accent</span>
            <input value={accent} onChange={(e) => setAccent(e.target.value)} type="color" />
          </label>

          <button className="ghost-btn" type="button" onClick={() => setDarkMode((current) => !current)}>
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="panel glass-panel editor-panel">
          <div className="panel-header">
            <div className="header-title">
              <span className="status-dot"></span>
              <h2>Code editor</h2>
            </div>

            <div className="button-row">
              <button className="primary-btn" type="button" onClick={applyChanges}>
                Apply
              </button>
              <button className="ghost-btn" type="button" onClick={resetEditor}>
                Reset
              </button>
            </div>
          </div>

          <textarea
            aria-label="HTML editor"
            spellCheck={false}
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
          />
        </section>

        <section className="panel glass-panel preview-panel">
          <div className="panel-header">
            <div className="header-title">
              <span className="status-dot success"></span>
              <h2>Live preview</h2>
            </div>

            <div className="button-row">
              <button className="ghost-btn" type="button" onClick={copyHtml}>
                {copied ? 'Copied' : 'Copy code'}
              </button>
              <button className="primary-btn" type="button" onClick={downloadHtml}>
                Download
              </button>
            </div>
          </div>

          <div className="preview-frame" dangerouslySetInnerHTML={{ __html: markup }} />
        </section>
      </main>
    </div>
  );
}

export default App;
