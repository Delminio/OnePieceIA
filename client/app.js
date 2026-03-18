const defaultApiBaseUrl = "http://localhost:3000";

const questionEl = document.getElementById("question");
const modeEl = document.getElementById("mode");
const apiBaseUrlEl = document.getElementById("apiBaseUrl");
const askButtonEl = document.getElementById("askButton");
const statusEl = document.getElementById("status");
const answerCardEl = document.getElementById("answerCard");
const answerEl = document.getElementById("answer");
const sourcesEl = document.getElementById("sources");

apiBaseUrlEl.value = localStorage.getItem("onepiece_api_base_url") || defaultApiBaseUrl;

apiBaseUrlEl.addEventListener("change", () => {
  localStorage.setItem("onepiece_api_base_url", apiBaseUrlEl.value.trim());
});

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? "status error" : "status";
}

function renderSources(sources = []) {
  if (!Array.isArray(sources) || sources.length === 0) {
    sourcesEl.innerHTML = "<p>Nenhuma fonte local/wiki foi recuperada.</p>";
    return;
  }

  sourcesEl.innerHTML = sources
    .map((source) => {
      const urlBlock = source.url?.startsWith("http")
        ? `<a href="${source.url}" target="_blank" rel="noreferrer">Abrir fonte</a>`
        : `<span>${source.url || "sem url"}</span>`;

      return `
        <div class="source-item">
          <strong>${source.title}</strong>
          <div>${source.source} • ${source.category}</div>
          <div>${urlBlock}</div>
          <p>${source.excerpt || ""}</p>
        </div>
      `;
    })
    .join("");
}

async function askQuestion() {
  const question = questionEl.value.trim();
  const mode = modeEl.value;
  const apiBaseUrl = apiBaseUrlEl.value.trim().replace(/\/$/, "");

  if (!question) {
    setStatus("Digite uma pergunta primeiro.", true);
    return;
  }

  if (!apiBaseUrl) {
    setStatus("Informe a URL base da sua API.", true);
    return;
  }

  askButtonEl.disabled = true;
  setStatus("Consultando a tripulação...");
  answerCardEl.classList.add("hidden");

  try {
    const response = await fetch(`${apiBaseUrl}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question, mode })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Falha ao consultar a API.");
    }

    answerEl.textContent = data.answer || "Sem resposta.";
    renderSources(data.sources || []);
    answerCardEl.classList.remove("hidden");
    setStatus("Resposta pronta.");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Erro inesperado.", true);
  } finally {
    askButtonEl.disabled = false;
  }
}

askButtonEl.addEventListener("click", askQuestion);
questionEl.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    askQuestion();
  }
});
