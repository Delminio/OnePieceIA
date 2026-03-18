const STORAGE_KEY = "onepiece_ai_premium_state";

const DEFAULT_API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://onepieceia.onrender.com";

if (!localStorage.getItem("apiBaseUrl")) {
  localStorage.setItem("apiBaseUrl", DEFAULT_API_URL);
}

const API_BASE_URL =
  localStorage.getItem("apiBaseUrl") || DEFAULT_API_URL;

const defaultState = {
  apiBaseUrl: API_BASE_URL,
  mode: "hybrid",
  spoilerLevel: "normal",
  messages: []
};

const ui = {
  apiBaseUrl: document.getElementById("apiBaseUrl"),
  mode: document.getElementById("mode"),
  spoilerLevel: document.getElementById("spoilerLevel"),
  messages: document.getElementById("messages"),
  status: document.getElementById("status"),
  sources: document.getElementById("sources"),
  sourcesPanel: document.getElementById("sourcesPanel"),
  sourceSummary: document.getElementById("sourceSummary"),
  sourceCount: document.getElementById("sourceCount"),
  messageCount: document.getElementById("messageCount"),
  question: document.getElementById("question"),
  composer: document.getElementById("composer"),
  askButton: document.getElementById("askButton"),
  clearChatButton: document.getElementById("clearChatButton"),
  template: document.getElementById("messageTemplate")
};

let state = loadState();

function loadState() {
  try {
    return { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setStatus(message, isError = false) {
  ui.status.textContent = message;
  ui.status.className = isError ? "status error" : "status";
}

function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function renderMessages() {
  ui.messages.innerHTML = "";

  if (!state.messages.length) {
    const starter = document.createElement("div");
    starter.className = "empty-state";
    starter.innerHTML = `
      <strong>Comece com uma pergunta.</strong>
      <span>Você pode pedir comparação entre mangá, anime e live action, pedir resposta sem spoilers ou aprofundar um personagem.</span>
    `;
    ui.messages.appendChild(starter);
  }

  for (const item of state.messages) {
    const node = ui.template.content.firstElementChild.cloneNode(true);
    node.classList.add(item.role === "assistant" ? "assistant" : "user");
    node.querySelector(".avatar").textContent = item.role === "assistant" ? "AI" : "EU";
    node.querySelector(".role-name").textContent = item.role === "assistant" ? "One Piece AI" : "Você";
    node.querySelector(".time").textContent = item.time || formatTime();
    node.querySelector(".bubble").textContent = item.content;
    ui.messages.appendChild(node);
  }

  ui.messages.scrollTop = ui.messages.scrollHeight;
  ui.messageCount.textContent = String(state.messages.length);
}

function renderSources(sources = []) {
  ui.sourceCount.textContent = String(sources.length);
  ui.sourceSummary.textContent = `${sources.length} item(ns)`;

  if (!sources.length) {
    ui.sourcesPanel.classList.add("hidden");
    ui.sources.innerHTML = "";
    return;
  }

  ui.sourcesPanel.classList.remove("hidden");
  ui.sources.innerHTML = sources
    .map((source) => {
      const safeUrl = source.url?.startsWith("http") ? source.url : "#";
      return `
        <article class="source-card">
          <div class="source-top">
            <div>
              <strong>${source.title}</strong>
              <div class="source-meta">${source.source} • ${source.category} • score ${source.score ?? 0}</div>
            </div>
            <a href="${safeUrl}" target="_blank" rel="noreferrer">Abrir</a>
          </div>
          <p>${source.excerpt || source.content || ""}</p>
        </article>
      `;
    })
    .join("");
}

function syncControls() {
  ui.apiBaseUrl.value = state.apiBaseUrl;
  ui.mode.value = state.mode;
  ui.spoilerLevel.value = state.spoilerLevel;
}

function getHistoryPayload() {
  return state.messages.slice(-8).map((item) => ({
    role: item.role,
    content: item.content
  }));
}

async function askQuestion(question) {
  const apiBaseUrl = state.apiBaseUrl.trim().replace(/\/$/, "");
  if (!apiBaseUrl) {
    setStatus("Informe a URL da API antes de perguntar.", true);
    return;
  }

  state.messages.push({ role: "user", content: question, time: formatTime() });
  saveState();
  renderMessages();

  ui.askButton.disabled = true;
  setStatus("Consultando fontes e montando resposta profissional...");
  renderSources([]);

  try {
    const response = await fetch(`${apiBaseUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        mode: state.mode,
        spoilerLevel: state.spoilerLevel,
        history: getHistoryPayload()
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Falha ao consultar a API.");

    state.messages.push({ role: "assistant", content: data.answer || "Sem resposta.", time: formatTime() });
    saveState();
    renderMessages();
    renderSources(data.sources || []);
    setStatus(`Resposta pronta com ${data.meta?.sourceCount ?? 0} fonte(s).`);
  } catch (error) {
    state.messages.push({ role: "assistant", content: `Erro: ${error.message}`, time: formatTime() });
    saveState();
    renderMessages();
    setStatus(error.message || "Erro inesperado.", true);
  } finally {
    ui.askButton.disabled = false;
  }
}

ui.apiBaseUrl.addEventListener("change", () => {
  state.apiBaseUrl = ui.apiBaseUrl.value.trim();
  saveState();
});
ui.mode.addEventListener("change", () => {
  state.mode = ui.mode.value;
  saveState();
});
ui.spoilerLevel.addEventListener("change", () => {
  state.spoilerLevel = ui.spoilerLevel.value;
  saveState();
});
ui.clearChatButton.addEventListener("click", () => {
  state.messages = [];
  saveState();
  renderMessages();
  renderSources([]);
  setStatus("Conversa limpa.");
});
ui.composer.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = ui.question.value.trim();
  if (!question) {
    setStatus("Digite uma pergunta primeiro.", true);
    return;
  }
  ui.question.value = "";
  await askQuestion(question);
});
ui.question.addEventListener("keydown", async (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    ui.composer.requestSubmit();
  }
});

syncControls();
renderMessages();
renderSources([]);
