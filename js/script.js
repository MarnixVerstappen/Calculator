// --------------------
// Global Query Selectors
// --------------------
const display = document.querySelector(".display");
const historyLine = document.querySelector(".history");
const buttons = document.querySelectorAll(".btn");
const themeToggle = document.getElementById("theme-toggle");
const menuToggle = document.getElementById("menu-toggle");
const historyPanel = document.getElementById("history-panel");

// --------------------
// Calculator State
// --------------------
let current = "0";
let previous = null;
let operator = null;
let expression = "";
let justCalculated = false; // track if last press was "="

// --------------------
// Operator Mapping
// --------------------
const opMap = {
  "+": "+",
  "-": "-",
  "−": "-",
  "x": "*",
  "X": "*",
  "*": "*",
  "×": "*",
  "/": "/",
  "÷": "/",
  ":": "/",
};

// --------------------
// THEME MANAGEMENT
// --------------------
let currentTheme = "dark"; // default theme

// Load saved theme or fallback to dark
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.classList.add(`${savedTheme}-theme`);
  currentTheme = savedTheme;
} else {
  document.body.classList.add("dark-theme");
  currentTheme = "dark";
}

// Toggle theme button
themeToggle.addEventListener("click", () => {
  document.body.classList.remove("dark-theme", "light-theme", "blue-theme");

  if (currentTheme === "dark") {
    currentTheme = "light";
  } else if (currentTheme === "light") {
    currentTheme = "blue";
  } else {
    currentTheme = "dark";
  }

  document.body.classList.add(`${currentTheme}-theme`);
  localStorage.setItem("theme", currentTheme);
});

// --------------------
// MENU (Hamburger)
// --------------------
const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);

menuToggle.addEventListener("click", () => {
  historyPanel.classList.toggle("open");
  overlay.classList.toggle("show");
});

overlay.addEventListener("click", () => {
  historyPanel.classList.remove("open");
  overlay.classList.remove("show");
});

// --------------------
// HISTORY MANAGEMENT
// --------------------
const calcHistory = [];

// Render history list
function renderHistory() {
  const list = document.querySelector(".history-list");
  if (!list) return;
  list.innerHTML = calcHistory.map(item => `<li>${item}</li>`).join("");
}

// Add expression to history
function addToHistory(entry) {
  calcHistory.unshift(entry);
  if (calcHistory.length > 10) calcHistory.pop(); // limit
  localStorage.setItem("calcHistory", JSON.stringify(calcHistory));
  renderHistory();
}

// Load old history from localStorage on startup
const savedHistoryList = JSON.parse(localStorage.getItem("calcHistory") || "[]");
if (savedHistoryList.length > 0) {
  calcHistory.push(...savedHistoryList);
  renderHistory();
}

// Reuse history entry (click on it)
document.addEventListener("click", (e) => {
  if (e.target.closest(".history-list li")) {
    const chosen = e.target.textContent.split("=")[0].trim();
    allClear();
    expression = chosen;
    current = "0";
    updateDisplay();
  }
});

// --------------------
// CALCULATOR FUNCTIONS
// --------------------
function prettyOp(op) {
  switch (op) {
    case "+": return "+";
    case "-": return "−";
    case "*": return "×";
    case "/": return "÷";
    default: return "";
  }
}

function updateDisplay() {
  display.textContent = current;
  historyLine.textContent = expression;
}

function appendDigit(d) {
  if (justCalculated) {
    current = "0";
    expression = "";
    justCalculated = false;
  }

  if (d === ".") {
    if (!current.includes(".")) {
      current += ".";
      expression += ".";
    }
    return;
  }

  current = (current === "0" || (operator && previous !== null && current === "0")) ? d : current + d;
  expression += d;
}

function setOperator(sym) {
  const op = opMap[sym];
  if (!op) return;

  // Special negative at start
  if ((current === "0" && previous === null && expression === "") && op === "-") {
    current = "-";
    expression = "-";
    return;
  }

  if (operator && previous !== null) {
    compute();
  } else {
    previous = current;
  }

  operator = op;
  current = "0";
  expression += " " + prettyOp(op) + " ";
  justCalculated = false;
}

function compute() {
  if (!operator || previous === null) return;

  const a = parseFloat(previous);
  const b = parseFloat(current);
  let result;

  switch (operator) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "*": result = a * b; break;
    case "/": result = b !== 0 ? a / b : "Error"; break;
  }

  current = String(result);
  previous = null;
  operator = null;
}

function pressEquals() {
  if (operator && previous !== null) {
    expression += " =";
    compute();
    expression += " " + current;
    justCalculated = true;

    addToHistory(expression); // save expression + answer
  }
}

function allClear() {
  current = "0";
  previous = null;
  operator = null;
  expression = "";
  justCalculated = false;
}

function backspace() {
  if (justCalculated) return;

  current = current.length > 1 ? current.slice(0, -1) : "0";
  expression = expression.length > 0 ? expression.slice(0, -1).trimEnd() : "";
}

function toggleSign() {
  if (current === "0") return;
  current = String(parseFloat(current) * -1);

  // Replace last in expression
  const parts = expression.trim().split(" ");
  parts[parts.length - 1] = current;
  expression = parts.join(" ");
}

function percent() {
  current = String(parseFloat(current) / 100);
  expression += "%";
}

// --------------------
// EVENT HANDLERS
// --------------------

// Button handlers
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.textContent.trim();

    if (!isNaN(value)) appendDigit(value);
    else if (value === ".") appendDigit(".");
    else if (value === "AC") allClear();
    else if (value === "⌫") backspace();
    else if (value === "+/-") toggleSign();
    else if (value === "%") percent();
    else if (value === "=") pressEquals();
    else setOperator(value);

    updateDisplay();
  });
});

// Keyboard handlers
document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k >= "0" && k <= "9") appendDigit(k);
  else if (k === ".") appendDigit(".");
  else if (k === "Enter" || k === "=") pressEquals();
  else if (k === "Escape") allClear();
  else if (k === "Backspace") backspace();
  else if (["+", "-", "*", "/", "x", "X", ":", "÷"].includes(k)) setOperator(k);
  else if (k === "%") percent();

  updateDisplay();
});

// --------------------
// INIT
// --------------------
updateDisplay();