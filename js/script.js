const display = document.querySelector(".display");
const history = document.querySelector(".history");
const buttons = document.querySelectorAll(".btn");

let current = "0";
let previous = null;
let operator = null;
let expression = "";
let justCalculated = false; // track if last press was =

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
  }

  updateDisplay();
});

updateDisplay();
