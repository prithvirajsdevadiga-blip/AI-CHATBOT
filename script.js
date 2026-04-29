const API_KEY ="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";
const chatBox = document.getElementById("chat-box");
const historyList = document.getElementById("history-list");
const fileUpload = document.getElementById("file-upload");
const fileList = document.getElementById("file-list");
const sendBtn = document.getElementById("send-btn");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const clearHistoryBtn = document.getElementById("clear-history");
const userInput = document.getElementById("user-input");

let conversationHistory = [];
let selectedFiles = [];

function setActiveTab(tabName) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${tabName}-panel`);
  });
}

function renderFileChips() {
  fileList.innerHTML = selectedFiles
    .map((file) => `<span class="file-chip">${file.name}</span>`)
    .join("");
}

function addMessage(content, role) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = content;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateHistory() {
  historyList.innerHTML = "";
  if (conversationHistory.length === 0) {
    historyList.innerHTML = `<p class="empty-state">No history yet. Start a conversation to save your chat.</p>`;
    return;
  }

  conversationHistory.slice().reverse().forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `<strong>${entry.user}</strong><br><span>${entry.bot}</span>`;
    historyList.appendChild(item);
  });
}

async function submitMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  const attachmentText = selectedFiles.length
    ? `\n\n[Attached files: ${selectedFiles.map((file) => file.name).join(", ")}]`
    : "";

  const promptPayload = `${message}${attachmentText}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: promptPayload }],
      }),
    });

    const data = await response.json();
    const botReply = data?.choices?.[0]?.message?.content || "I couldn't parse a response. Please try again.";

    addMessage(botReply, "bot");
    conversationHistory.push({ user: message, bot: botReply });
    updateHistory();
  } catch (error) {
    addMessage("Error: Unable to fetch response. Check your connection.", "bot");
  } finally {
    selectedFiles = [];
    renderFileChips();
  }
}

function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  selectedFiles = files;
  renderFileChips();

  if (files.length === 1) {
    addMessage(`Uploaded file: ${files[0].name}`, "bot");
  } else {
    addMessage(`Uploaded ${files.length} files. Ready to send with your next message.`, "bot");
  }
}

function clearHistory() {
  conversationHistory = [];
  updateHistory();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

sendBtn.addEventListener("click", submitMessage);
userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitMessage();
  }
});
fileUpload.addEventListener("change", handleFileUpload);
clearHistoryBtn.addEventListener("click", clearHistory);

setActiveTab("chat");
updateHistory(); 
