class UI {

  static showLoader() {
    document.getElementById("result").innerHTML =
      `<div class="loader"></div>`;
  }

  static showResult(data, type) {
    const resultDiv = document.getElementById("result");

    let output;

    if (type === "compare") {
      output = data ? "✅ Equal" : "❌ Not Equal";
    } else {
      output = `<strong>${JSON.stringify(data)}</strong>`;
    }

    resultDiv.innerHTML = `<div class="fade-in">${output}</div>`;
  }

  static addHistory(entry) {
    const history = document.getElementById("history");

    history.innerHTML =
      `<div class="history-item">${entry}</div>` +
      history.innerHTML;
  }

  static showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msg;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }
}