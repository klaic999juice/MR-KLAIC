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

const htmlEditor = document.getElementById("htmlEditor");
const preview = document.getElementById("preview");
const pageTitleInput = document.getElementById("pageTitle");
const accentColorInput = document.getElementById("accentColor");
const themeToggle = document.getElementById("themeToggle");
const applyBtn = document.getElementById("applyBtn");
const resetBtn = document.getElementById("resetBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

const savedState = JSON.parse(localStorage.getItem("pageForgeState") || "null");

function computeDarkerColor(hex) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  const darken = (channel) => Math.max(0, Math.round(channel * 0.82));
  return `#${[darken(r), darken(g), darken(b)]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function applyMarkup() {
  const markup = htmlEditor.value;
  preview.innerHTML = markup;
  document.title = pageTitleInput.value.trim() || "Nova Studio";
  document.documentElement.style.setProperty("--accent", accentColorInput.value);
  document.documentElement.style.setProperty("--accent-strong", computeDarkerColor(accentColorInput.value));

  localStorage.setItem(
    "pageForgeState",
    JSON.stringify({
      title: pageTitleInput.value,
      accent: accentColorInput.value,
      isDark: document.body.classList.contains("dark"),
      markup: markup,
    })
  );
}

function setTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  applyMarkup();
}

function resetEditor() {
  htmlEditor.value = defaultMarkup;
  pageTitleInput.value = "Build launches people remember";
  accentColorInput.value = "#7c3aed";
  setTheme(false);
  applyMarkup();
}

function copyHtml() {
  navigator.clipboard.writeText(htmlEditor.value).then(() => {
    copyBtn.textContent = "Copied";
    setTimeout(() => (copyBtn.textContent = "Copy code"), 1200);
  });
}

function downloadHtml() {
  const blob = new Blob([htmlEditor.value], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(pageTitleInput.value || "page").toLowerCase().replace(/\s+/g, "-")}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

htmlEditor.value = savedState?.markup || defaultMarkup;
pageTitleInput.value = savedState?.title || "Build launches people remember";
accentColorInput.value = savedState?.accent || "#7c3aed";
setTheme(Boolean(savedState?.isDark));
applyMarkup();

applyBtn.addEventListener("click", applyMarkup);
resetBtn.addEventListener("click", resetEditor);
copyBtn.addEventListener("click", copyHtml);
downloadBtn.addEventListener("click", downloadHtml);
themeToggle.addEventListener("click", () => setTheme(!document.body.classList.contains("dark")));
pageTitleInput.addEventListener("input", applyMarkup);
accentColorInput.addEventListener("input", applyMarkup);
htmlEditor.addEventListener("input", applyMarkup);
