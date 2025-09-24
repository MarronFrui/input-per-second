const counter = document.querySelector("#counter");
const frequency = document.querySelector("#rate");
const maxRate = document.querySelector("#max-rate");
const selectedKeyElement = document.querySelector("#selected-key");
const resetButton = document.querySelector("#reset");
const maxSamples = 10;
const layout = [
  "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
  "{tab} q w e r t y u i o p [ ] {enter}",
  "{capslock} a s d f g h j k l ; '",
  "{shiftleft} z x c v b n m , . / {shiftright}",
  "{ctrlleft} {altleft} {space} {altright} {ctrlright}"
];
const specialKeyMap = {
  "{backspace}": { code: "Backspace", label: "Backspace" },
  "{tab}": { code: "Tab", label: "Tab" },
  "{capslock}": { code: "CapsLock", label: "Caps" },
  "{enter}": { code: "Enter", label: "Enter" },
  "{shiftleft}": { code: "ShiftLeft", label: "Shift" },
  "{shiftright}": { code: "ShiftRight", label: "Shift" },
  "{ctrlleft}": { code: "ControlLeft", label: "Ctrl" },
  "{ctrlright}": { code: "ControlRight", label: "Ctrl" },
  "{altleft}": { code: "AltLeft", label: "Alt" },
  "{altright}": { code: "AltRight", label: "Alt" },
  "{space}": { code: "Space", label: "Space" }
};

let timestamps = [];
let maxIPS = 0;
let selectedKey = null;
let pressCount = 0;
let currentPressedKey = null;

document.addEventListener("keydown", (e) => {
  const keyDiv = document.querySelector(`.key[data-code="${e.code}"]`);
  e.preventDefault();
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
  const keyDiv = document.querySelector(`.key[data-code="${e.code}"]`);
  if (keyDiv) keyDiv.classList.remove("active");

  if (e.key === currentPressedKey) {
    currentPressedKey = null;
  }
});

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

// Array containing numbers
function makeDigits() {
  return Array.from({ length: 10 }, (_, i) => ({
    code: `Digit${i}`,
    label: i.toString()
  }));
}

// Array containing letters
function makeLetters(start, end, labelCase = "upper") {
  let firstChar = start.toUpperCase().charCodeAt(0);
  let lastChar = end.toUpperCase().charCodeAt(0);
  if (firstChar > lastChar) [firstChar, lastChar] = [lastChar, firstChar];

  return Array.from({ length: lastChar - firstChar + 1 }, (_, i) => {
    const ch = String.fromCharCode(firstChar + i);    // 'A'..'Z'
    const label = labelCase === "lower" ? ch.toLowerCase() : ch;
    return { code: `Key${ch}`, label };
  });
}

function calculateFrequency(timestamps) {
  let delta = 0;
  for (let i = 1; i < timestamps.length; i++) {
    delta += timestamps[i] - timestamps[i - 1];
  }
  const averageDelta = delta / (timestamps.length - 1) / 1000;
  return 1 / averageDelta;
}

// Everything related to keyboard display

function renderKeyboard(layout) {
  layout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    const tokens = row.split(" ");
    tokens.forEach(token => {
      let keyDef;

      if (specialKeyMap[token]) {
        // Special key from dictionary
        keyDef = specialKeyMap[token];
      } else {
        // Normal character
        const label = token;
        const code = token.length === 1 && /[a-z]/i.test(token)
          ? `Key${label.toUpperCase()}`
          : `Digit${label}`;
        keyDef = { code, label };
      }

      const keyDiv = document.createElement("div");
      keyDiv.className = "key";
      keyDiv.dataset.code = keyDef.code;
      keyDiv.textContent = keyDef.label;

      rowDiv.appendChild(keyDiv);
    });

    keyboardContainer.appendChild(rowDiv);
  });
}

renderKeyboard(layout);
