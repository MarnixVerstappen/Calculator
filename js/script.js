const display = document.querySelector(".display");
const history = document.querySelector(".history");
const buttons = document.querySelectorAll(".btn");
const themeToggle = document.getElementById("theme-toggle");

let current = "0";
let previous = null;
let operator = null;
let expression = "";
let justCalculated = false; // track if last press was =

// Theme variables
let currentTheme = "dark"; // default theme

// Set initial theme class
document.body.classList.add("dark-theme");

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

console.log("Initial theme:", currentTheme); // Log initial theme

localStorage.setItem("theme", currentTheme);
const savedTheme = localStorage.getItem("theme") || "dark";
document.body.classList.add(`${savedTheme}-theme`);
currentTheme = savedTheme;

// Function to toggle theme
themeToggle.addEventListener("click", () => {
    console.log("Theme toggle clicked"); // Log when toggle is clicked
    console.log("Current theme before toggle:", currentTheme); // Log current theme before toggle
    // Remove all theme classes
    document.body.classList.remove("dark-theme", "light-theme", "blue-theme");
    
    // Cycle through themes
    if (currentTheme === "dark") {
        document.body.classList.add("light-theme");
        currentTheme = "light";
    } else if (currentTheme === "light") {
        document.body.classList.add("blue-theme");
        currentTheme = "blue";
    } else {
        document.body.classList.add("dark-theme");
        currentTheme = "dark";
    }
    console.log("Current theme after toggle:", currentTheme); // Log current theme after toggle
    console.log("Theme classes on body:", document.body.classList); // Log current classes on body
});

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
  history.textContent = expression;
}

function backspace() {
  if (justCalculated) return; // Do nothing if last was '='
  
  if (current.length > 1) {
    current = current.slice(0, -1);  // remove last char
  } else {
    current = "0"; // reset if empty
  }

  // Update expression string too
  if (expression.length > 0) {
    expression = expression.slice(0, -1).trimEnd();
  }

  updateDisplay();
}
function appendDigit(d) {
  if (justCalculated) {
    // start new calc after =
    current = "0";
    expression = "";
    justCalculated = false;
  }

  if (d === ".") {
    if (current.includes(".")) return;
    current += ".";
    expression += ".";
  } else {
    if (current === "0" || (operator && previous !== null && current === "0")) {
      current = d;
    } else {
      current += d;
    }
    expression += d;
  }
}

function setOperator(sym) {
  const op = opMap[sym];
  if (!op) return;

  // Special case: if starting with "-" and current is 0
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
  }
}

function allClear() {
  current = "0";
  previous = null;
  operator = null;
  expression = "";
  justCalculated = false;
}

function toggleSign() {
  if (current === "0") return;
  current = String(parseFloat(current) * -1);
  // Replace last number in history with signed version
  const parts = expression.trim().split(" ");
  parts[parts.length - 1] = current;
  expression = parts.join(" ");
}

function percent() {
  current = String(parseFloat(current) / 100);
  expression += "%";
}

// ----- Button clicks -----
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.textContent.trim();

    if (!isNaN(value)) {
      appendDigit(value);
    } else if (value === ".") {
      appendDigit(".");
    } else if (value === "AC") {
      allClear();
    } else if (value === "⌫") {
      backspace();
    } else if (value === "+/-") {
      toggleSign();
    } else if (value === "%") {
      percent();
    } else if (value === "=") {
      pressEquals();
    } else {
      setOperator(value);
    }

    updateDisplay();
  });
});

// ----- Keyboard support -----
document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k >= "0" && k <= "9") {
    appendDigit(k);
  } else if (k === ".") {
    appendDigit(".");
  } else if (k === "Enter" || k === "=") {
    pressEquals();
  } else if (k === "Escape") {
    allClear();
  } else if (["+", "-", "*", "/", "x", "X", ":", "÷"].includes(k)) {
    setOperator(k);
  } else if (k === "%") {
    percent();
  } else if (k === "Backspace") {
      backspace();
}

  updateDisplay();
});

updateDisplay();
