const counter = document.querySelector("#counter");
const frequency = document.querySelector("#rate");
const maxRate = document.querySelector("#max-rate");
const selectedKeyElement = document.querySelector("#selected-key");
const resetButton = document.querySelector("#reset");

const maxSamples = 10;
const specialRows = [
  [
    { code: "Escape", label: "Esc" },
    { code: "F1", label: "F1" },
    { code: "F2", label: "F2" },
    { code: "F3", label: "F3" },
    { code: "F4", label: "F4" },
  ],
  [
    { code: "Tab", label: "Tab" },
    { code: "Backspace", label: "Backspace" }
  ],
  [
    { code: "CapsLock", label: "Caps" },
    { code: "Enter", label: "Enter" }
  ],
  [
    { code: "ShiftLeft", label: "Shift" },
    { code: "ShiftRight", label: "Shift" }
  ],
  [
    { code: "ControlLeft", label: "Ctrl" },
    { code: "AltLeft", label: "Alt" },
    { code: "Space", label: "Space" },
    { code: "AltRight", label: "Alt" },
    { code: "ControlRight", label: "Ctrl" }
  ]
];
let timestamps = [];
let maxIPS = 0;
let selectedKey = null;
let pressCount = 0;
let currentPressedKey = null;

// Array containing numbers
function makeDigits() {
  return Array.from({ length: 10 }, (_, i) => ({
    code: `Digit${i}`,
    label: i.toString()
  }));
}

// Array containing letters
function makeLetters(start, end, labelCase = "upper") {
  let debut = start.toUpperCase().charCodeAt(0);
  let fin = end.toUpperCase().charCodeAt(0);
  if (debut > fin) [debut, fin] = [fin, debut];

  return Array.from({ length: fin - debut + 1 }, (_, i) => {
    const ch = String.fromCharCode(debut + i);    // 'A'..'Z'
    const label = labelCase === "lower" ? ch.toLowerCase() : ch;
    return { code: `Key${ch}`, label };
  });
}

resetButton.addEventListener("click", () => {
  pressCount = 0;
  counter.textContent = `Frappes : 0`;
  frequency.textContent = `IPS : 0`;
  maxRate.textContent = `IPS max : 0`;
  selectedKey = null;
  selectedKeyElement.textContent = `Tu pètes le : Aucune`;
  timestamps = [];
  maxIPS = 0;
});

document.addEventListener("keydown", (e) => {
  const keyDiv = document.querySelector(`.key[data-code="${event.code}"]`);
  if (keyDiv) keyDiv.classList.add("active");

  if (e.key === "Alt" || e.key === "AltRight" || e.key === "AltGraph") {
    return;
  }

  if (!selectedKey) {
    selectedKey = e.key;
    selectedKeyElement.textContent = `Tu pètes le : ${selectedKey.toUpperCase()}`;
    return;
  }

  if (e.key !== selectedKey) {
    selectedKey = e.key;
    selectedKeyElement.textContent = `Tu pètes le : ${selectedKey.toUpperCase()}`;
    pressCount = 0;
    counter.textContent = `Total : 0`;
    frequency.textContent = `Input par seconde : 0`;
    timestamps = [];
    return;
  }

  if (e.key !== selectedKey || currentPressedKey === e.key) return;

  currentPressedKey = e.key;
  pressCount++;
  counter.textContent = `Total : ${pressCount}`;

  const now = Date.now();
  timestamps.push(now);
  if (timestamps.length > maxSamples) {
    timestamps.shift();
  }

  const ips = calculateFrequency(timestamps);
  if (timestamps.length >= 2) {
    frequency.textContent = `Input par seconde : ${ips.toFixed(2)}`;
  }
  if (pressCount >= 10 && ips > maxIPS) {
    maxIPS = ips;
    maxRate.textContent = `IPS max : ${maxIPS.toFixed(2)}`;
  }
});

document.addEventListener("keyup", (e) => {
  const keyDiv = document.querySelector(`.key[data-code="${event.code}"]`);
  if (keyDiv) keyDiv.classList.remove("active");
  if (e.key === currentPressedKey) {
    currentPressedKey = null;
  }
});

function calculateFrequency(timestamps) {
  let delta = 0;
  for (let i = 1; i < timestamps.length; i++) {
    delta += timestamps[i] - timestamps[i - 1];
  }
  const averageDelta = delta / (timestamps.length - 1) / 1000;
  return 1 / averageDelta;
}

// Everything related to keyboard display
const keyboardContainer = document.getElementById("keyboard");
const topRow = specialRows[0];
const digitRow = [...makeDigits(), specialRows[1][1]]; // 0-9 + Backspace
const rowQtoP = [specialRows[1][0], ...makeLetters("Q", "P"), specialRows[2][1]]; // Tab + Q-P + Enter
const rowAtoL = [specialRows[2][0], ...makeLetters("A", "L")]; // CapsLock + A-L
const rowZtoM = [specialRows[3][0], ...makeLetters("Z", "M"), specialRows[3][1]]; // Shift + Z-M + Shift
const bottomRow = specialRows[4];
const keyboardLayout = [topRow, digitRow, rowQtoP, rowAtoL, rowZtoM, bottomRow];

// Generate the keyboard DOM
keyboardLayout.forEach((row) => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "row";

  row.forEach((key) => {
    const keyDiv = document.createElement("div");
    keyDiv.className = "key";
    keyDiv.dataset.code = key.code;
    keyDiv.textContent = key.label;
    rowDiv.appendChild(keyDiv);
  });

  keyboardContainer.appendChild(rowDiv);
});
