// <ai-chat> — site-scoped assistant, dormant by default.
// Talks to /api/chat. If the endpoint returns 503 the panel hides the
// input and shows the dormant state with a clear Hebrew copy until
// CHAT_ENABLED is flipped.

class AiChat extends HTMLElement {
  connectedCallback() {
    this.renderShell();
    this.form.addEventListener("submit", (e) => this.onSubmit(e));
    this.refreshStatus();
  }

  renderShell() {
    this.innerHTML = `
      <section class="ai-chat" aria-labelledby="ai-chat-heading">
        <header class="ai-chat__header">
          <h2 id="ai-chat-heading">שאל אותנו</h2>
          <p class="ai-chat__lede" id="ai-chat-lede">
            הצ׳אט יענה רק על שאלות שמבוססות על תוכן האתר.
          </p>
        </header>
        <form class="ai-chat__form" id="ai-chat-form" hidden>
          <label class="visually-hidden" for="ai-chat-input">שאלה</label>
          <textarea
            id="ai-chat-input"
            name="q"
            rows="2"
            placeholder="לדוגמה: מתי נפתחה ההרשמה?"
            required
            maxlength="1000"
          ></textarea>
          <button type="submit" class="btn btn--primary">שלח</button>
        </form>
        <div class="ai-chat__status" id="ai-chat-status" role="status" aria-live="polite"></div>
        <ol class="ai-chat__thread" id="ai-chat-thread" hidden></ol>
      </section>
    `;
    this.form = this.querySelector("#ai-chat-form");
    this.input = this.querySelector("#ai-chat-input");
    this.status = this.querySelector("#ai-chat-status");
    this.thread = this.querySelector("#ai-chat-thread");
  }

  async refreshStatus() {
    try {
      const r = await fetch("/api/chat", { method: "GET" });
      if (r.status === 405) {
        // Endpoint exists and accepts POST. Cheap probe; treat as available.
        this.setEnabled();
        return;
      }
      this.setDisabled(r.status === 503 ? "dormant" : "unavailable");
    } catch {
      this.setDisabled("offline");
    }
  }

  setEnabled() {
    this.form.hidden = false;
    this.status.hidden = true;
  }

  setDisabled(reason) {
    this.form.hidden = true;
    const map = {
      dormant: "הצ׳אט כבוי כרגע ויופעל בקרוב.",
      unavailable: "הצ׳אט אינו זמין כרגע.",
      offline: "אין חיבור לרשת.",
    };
    this.status.textContent = map[reason] || "הצ׳אט אינו זמין.";
    this.status.hidden = false;
  }

  async onSubmit(e) {
    e.preventDefault();
    const q = this.input.value.trim();
    if (!q) return;
    this.appendMessage(q, "user");
    this.input.value = "";
    this.input.disabled = true;
    this.appendMessage("מחפש…", "thinking");
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await r.json();
      this.removeThinking();
      if (!r.ok || !data.ok) {
        this.appendMessage(this.friendlyError(data?.error), "error");
      } else {
        this.appendMessage(data.answer || "—", "assistant");
      }
    } catch (err) {
      this.removeThinking();
      this.appendMessage("שגיאת רשת. נסו שוב מאוחר יותר.", "error");
    } finally {
      this.input.disabled = false;
      this.input.focus();
    }
  }

  friendlyError(code) {
    if (code === "chat_disabled") return "הצ׳אט כבוי כרגע ויופעל בקרוב.";
    if (code === "ai_binding_missing") return "חסר חיבור לבינה מלאכותית.";
    if (code === "ai_failure") return "השירות אינו זמין כרגע. נסו שוב.";
    return "שגיאה לא צפויה.";
  }

  appendMessage(text, role) {
    if (!this.thread.hidden === false) this.thread.hidden = false;
    const li = document.createElement("li");
    li.className = `ai-chat__msg ai-chat__msg--${role}`;
    li.textContent = text;
    this.thread.appendChild(li);
    this.thread.hidden = false;
  }

  removeThinking() {
    const last = this.thread.querySelector(".ai-chat__msg--thinking");
    if (last) last.remove();
  }
}

customElements.define("ai-chat", AiChat);
