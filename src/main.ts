import { bangs as ddgBangs } from "./bang";
import { bangs as bangsExt } from "./bang-ext";
import "./global.css";

function loadCustomBangs() {
  const customBangsData = localStorage.getItem("custom-bangs") || "";
  if (!customBangsData) return [];

  const customBangs = customBangsData.split(",").filter(item => item.trim());
  const result = [];

  for (const item of customBangs) {
    const values = item.split(":");
    if (values.length === 2) {
      const urlTemplate = values[1];
      const domainMatch = urlTemplate.match(/https?:\/\/([^\/\?]+)/);
      const domain = domainMatch ? domainMatch[1] : "unknown";

      result.push({
        t: values[0],
        u: values[1],
        d: domain,
      });
    }
  }

  return result;
}

function saveCustomBangs(customBangs: Array<{ t: string, u: string, d: string }>) {
  const customBangsData = customBangs.map(bang => `${bang.t}:${bang.u}`).join(",");
  localStorage.setItem("custom-bangs", customBangsData);
}

function renderCustomBangsList() {
  const customBangs = loadCustomBangs();
  if (customBangs.length === 0) {
    return '<p class="no-custom-bangs">No custom bangs yet. Click "Add New" to create one.</p>';
  }

  return customBangs.map((bang, index) => `
    <div class="custom-bang-item editable" data-index="${index}">
      <input type="text" class="bang-input-field" value="${bang.t}" placeholder="xmpl" data-field="bang" data-index="${index}" />
      <input type="text" class="template-input-field" value="${bang.u}" placeholder="example.com?q={{query}}" data-field="template" data-index="${index}" />
      <button class="delete-bang-button" data-index="${index}">
        <img src="/trash.svg" alt="Delete" />
      </button>
    </div>
  `).join('');
}

function addCustomBang() {
  const customBangs = loadCustomBangs();
  const newBang = {
    t: "xmpl",
    u: "example.com?q={{query}}",
    d: "example.com"
  };
  customBangs.push(newBang);
  saveCustomBangs(customBangs);

  const newCustomBangs = loadCustomBangs();
  bangs.length = 0;
  bangs.push(...newCustomBangs, ...bangsExt, ...ddgBangs);

  const customBangsList = document.getElementById('custom-bangs-list');
  if (customBangsList) {
    customBangsList.innerHTML = renderCustomBangsList();
    setupCustomBangsEventListeners();
  }
}

function deleteCustomBang(index: number) {
  const customBangs = loadCustomBangs();
  customBangs.splice(index, 1);
  saveCustomBangs(customBangs);

  const newCustomBangs = loadCustomBangs();
  bangs.length = 0;
  bangs.push(...newCustomBangs, ...bangsExt, ...ddgBangs);

  const customBangsList = document.getElementById('custom-bangs-list');
  if (customBangsList) {
    customBangsList.innerHTML = renderCustomBangsList();
    setupCustomBangsEventListeners();
  }
}

function setupCustomBangsEventListeners() {
  const addBangButton = document.getElementById('add-bang-button');
  if (addBangButton) {
    addBangButton.addEventListener('click', addCustomBang);
  }

  const deleteButtons = document.querySelectorAll('.delete-bang-button');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
      deleteCustomBang(index);
    });
  });

  const bangInputs = document.querySelectorAll('.bang-input-field');
  bangInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const index = parseInt(target.dataset.index || '0');
      const field = target.dataset.field;
      const value = target.value;

      updateCustomBang(index, field as 'bang' | 'template', value);
    });
  });

  const templateInputs = document.querySelectorAll('.template-input-field');
  templateInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const index = parseInt(target.dataset.index || '0');
      const field = target.dataset.field;
      const value = target.value;

      updateCustomBang(index, field as 'bang' | 'template', value);
    });
  });
}

function updateCustomBang(index: number, field: 'bang' | 'template', value: string) {
  const customBangs = loadCustomBangs();
  if (customBangs[index]) {
    if (field === 'bang') {
      customBangs[index].t = value;
    } else if (field === 'template') {
      customBangs[index].u = value;
      const domainMatch = value.match(/https?:\/\/([^\/\?]+)/);
      customBangs[index].d = domainMatch ? domainMatch[1] : "unknown";
    }
    saveCustomBangs(customBangs);

    const newCustomBangs = loadCustomBangs();
    bangs.length = 0;
    bangs.push(...newCustomBangs, ...bangsExt, ...ddgBangs);
  }
}

const customBangs = loadCustomBangs();
const bangs = [...customBangs, ...bangsExt, ...ddgBangs];

const initialTheme = getTheme();
setTheme(initialTheme);

function setTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function getTheme(): "light" | "dark" {
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  if (savedTheme) {
    return savedTheme;
  }

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
  updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme: "light" | "dark") {
  const themeToggle =
    document.querySelector<HTMLButtonElement>(".theme-toggle");
  if (!themeToggle) return;

  const iconSrc = theme === "light" ? "/moon.svg" : "/sun.svg";
  const iconAlt =
    theme === "light" ? "Switch to dark mode" : "Switch to light mode";

  themeToggle.innerHTML = `<img src="${iconSrc}" alt="${iconAlt}" />`;
}

function noSearchDefaultPageRender() {
  const initialTheme = getTheme();
  setTheme(initialTheme);

  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <button class="theme-toggle" aria-label="Toggle dark mode">
        <img src="${initialTheme === "light" ? "/moon.svg" : "/sun.svg"}" alt="${initialTheme === "light" ? "Switch to dark mode" : "Switch to light mode"}" style="filter: var(--svg-filter);" />
      </button>
      <div class="content-container">
        <h1>Und*ck</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
        <div class="url-container"> 
          <input 
            type="text" 
            class="url-input"
            value="https://unduck.siesque.com?q=%s"
            readonly 
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
        <label class="bang-container">
          <p>Default Bang (currently <span class="bang-current"></span>)</p>
          <input
            class="bang-input"
            type="text"
            value="sxng"
          />
        </label>
        <div class="custom-bangs-container">
          <h3>Custom Bangs</h3>
          <div class="custom-bangs-list" id="custom-bangs-list">
            ${renderCustomBangsList()}
          </div>
          <div class="flex justify-center">
            <button class="add-bang-button" id="add-bang-button">Add New</button>
          </div>
        </div>
      </div>
      <footer class="footer">
        <a href="https://github.com/septechx/unduck" target="_blank">github</a>
      </footer>
    </div>
  `;

  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;
  const themeToggle = app.querySelector<HTMLButtonElement>(".theme-toggle")!;
  const bangInput = app.querySelector<HTMLInputElement>(".bang-input")!;
  const bangCurrent = app.querySelector<HTMLSpanElement>(".bang-current")!;

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });

  bangCurrent.innerText = bangInput.value =
    localStorage.getItem("default-bang") ?? "sxng";

  bangInput.addEventListener("input", () => {
    if (!bangInput.value) return;
    if (bangs.some((b) => b.t === bangInput.value)) {
      localStorage.setItem("default-bang", bangInput.value);
      bangInput.setCustomValidity("");
      bangCurrent.innerText = bangInput.value;
    } else {
      bangInput.setCustomValidity("Unknown bang");
    }
  });

  themeToggle.addEventListener("click", toggleTheme);

  setupCustomBangsEventListeners();
}

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "sxng";
const defaultBang = bangs.find((b) => b.t === LS_DEFAULT_BANG);

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!(\S+)/i);

  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;

  // Remove the first bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  // If the query is just `!gh`, use `github.com` instead of `github.com/search?q=`
  if (cleanQuery === "")
    return selectedBang ? `https://${selectedBang.d}` : null;

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function doRedirect() {
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();
