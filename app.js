// 🔐 Protect route
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// 🔥 Units
const units = {
  LENGTH: ["METER","CENTIMETER","MILLIMETER","KILOMETER","INCH","FEET","YARD"],
  WEIGHT: ["KILOGRAM","GRAM","POUND"],
  VOLUME: ["LITRE","MILLILITRE","GALLON"],
  TEMPERATURE: ["CELSIUS","FAHRENHEIT","KELVIN"]
};

// 🔥 Quantity Model
class Quantity {
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
  }
}

// 🔥 JWT Decode
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}
function checkTokenExpiry(token) {
  const data = parseJwt(token);

  if (!data || !data.exp) return;

  const expiry = data.exp * 1000; // convert to ms
  const now = Date.now();

  const timeout = expiry - now;

  if (timeout <= 0) {
    logout();
  } else {
    setTimeout(() => {
      UI.showToast("Session expired. Logging out...");
      logout();
    }, timeout);
  }
}

function toggleDropdown() {
  const dropdown = document.getElementById("dropdown");
  if (dropdown) dropdown.classList.toggle("hidden");
}
function toggleHistory() {
  const historyDiv = document.getElementById("history");
  const btn = document.getElementById("historyToggle");

  if (!historyDiv || !btn) return;

  if (historyDiv.classList.contains("hidden-history")) {
    historyDiv.classList.remove("hidden-history");
    historyDiv.classList.add("show-history");
    btn.innerText = "Hide";
  } else {
    historyDiv.classList.remove("show-history");
    historyDiv.classList.add("hidden-history");
    btn.innerText = "Show";
  }
}
// 🔥 Logout (GLOBAL)
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// 🔥 Main App
class App {
  

  constructor() {
    this.form = document.getElementById("form");
    this.category = document.getElementById("category");

    this.init();
  }

  init() {
  this.setUser();
  this.loadCategories();
  this.loadUnits();

  // 🔥 ensure history hidden initially
  const history = document.getElementById("history");
  if (history) history.classList.add("hidden-history");

  const btn = document.getElementById("historyToggle");
  if (btn) btn.innerText = "Show";

  this.category.addEventListener("change", () => this.loadUnits());

  this.form.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      e.preventDefault();
      this.handleOperation(e.target.dataset.op);
    }
  });

  // 🔥 close dropdown on outside click
  document.addEventListener("click", (e) => {
    const menu = document.querySelector(".user-menu");
    const dropdown = document.getElementById("dropdown");

    if (menu && dropdown && !menu.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
}

  // 👤 SET USER NAME FROM TOKEN
  setUser() {
  const token = localStorage.getItem("token");

  if (!token) return;

  const data = parseJwt(token);

  if (!data) return;

  // 👤 Name (email)
  if (data.sub) {
    document.getElementById("userName").innerText = data.sub;
    document.getElementById("userEmail").innerText = data.sub;
  }

  if (data.picture) {
    document.getElementById("userAvatar").src = data.picture;
  } else {
    // fallback avatar
    document.getElementById("userAvatar").src =
      "https://ui-avatars.com/api/?name=" + data.sub;
  }

  checkTokenExpiry(token);
}

  loadCategories() {
    this.category.innerHTML = Object.keys(units)
      .map(c => `<option>${c}</option>`)
      .join("");
  }

  loadUnits() {
    const cat = this.category.value;

    const unit1 = document.getElementById("unit1");
    const unit2 = document.getElementById("unit2");

    unit1.innerHTML = "";
    unit2.innerHTML = "";

    units[cat].forEach(u => {
      unit1.innerHTML += `<option>${u}</option>`;
      unit2.innerHTML += `<option>${u}</option>`;
    });
  }
  static addHistory(entry) {
  const history = document.getElementById("history");

  if (!history.innerHTML) {
    history.innerHTML = "";
  }

  history.innerHTML =
    `<div class="history-item">${entry}</div>` +
    history.innerHTML;
}
  async handleOperation(op) {
    try {

      const v1 = document.getElementById("value1").value;
      const v2 = document.getElementById("value2").value;

      const u1 = document.getElementById("unit1").value;
      const u2 = document.getElementById("unit2").value;

      // ⚠️ FIX: allow 0 values
      if (v1 === "" || v2 === "") {
        return UI.showToast("Please enter both values");
      }

      const body = [
        new Quantity(+v1, u1),
        new Quantity(+v2, u2)
      ];

      const map = {
        add: "/add",
        subtract: "/subtract",
        compare: "/compare",
        divide: "/divide"
      };

      UI.showLoader();

      const result = await api.request(map[op], body);
      const formatted = `${result.value} ${result.unit}`;
      UI.showResult(formatted, op);
      UI.addHistory(`${op.toUpperCase()} → ${JSON.stringify(result)}`);

    } catch (err) {
      UI.showToast(err.message || "Operation failed");
    }
  }
  
}

// 🚀 Start App
new App();