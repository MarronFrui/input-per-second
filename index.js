const counter = document.querySelector("#counter");
const frequency = document.querySelector("#rate");
const maxRate = document.querySelector("#max-rate");
const selectedKeyElement = document.querySelector("#selected-key");
const resetButton = document.querySelector("#reset");
const keyboardContainer = document.getElementById("keyboard");
const layoutToggleButton = document.getElementById("layout-toggle");

const maxSamples = 10;

const qwertyLayout = [
  "F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12",
  "` 1 2 3 4 5 6 7 8 9 0 - = backspace",
  "tab q w e r t y u i o p [ ] enter",
  "CAPSLOCK a s d f g h j k l ; '",
  "shiftleft z x c v b n m , . / shiftright",
  "CONTROL altleft space altright ctrlright"
];

const azertyLayout = [
  "F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12",
  "² & é \" ' ( - è _ ç à ) = backspace",
  "tab a z e r t y u i o p ^ $ enter",
  "CAPSLOCK q s d f g h j k l m ù *",
  "shiftleft w x c v b n , ; : ! shiftright",
  "CONTROL altleft space altright ctrlright"
];

const specialKeyMap = {
  "backspace": { code: "Backspace", label: "Backspace" },
  "tab": { code: "Tab", label: "Tab" },
  "capslock": { code: "CapsLock", label: "Caps" },
  "enter": { code: "Enter", label: "Enter" },
  "shiftleft": { code: "ShiftLeft", label: "Shift" },
  "shiftright": { code: "ShiftRight", label: "Shift" },
  "ctrlleft": { code: "ControlLeft", label: "Ctrl" },
  "ctrlright": { code: "ControlRight", label: "Ctrl" },
  "altleft": { code: "AltLeft", label: "Alt" },
  "altright": { code: "AltRight", label: "Alt" },
  "space": { code: "Space", label: "Space" }
};

const deadKeyMap = {
  "Backquote": "^",   // top-left key
  "IntlBackslash": "¨" // some layouts
};

let timestamps = [];
let maxIPS = 0;
let selectedKey = null;
let pressCount = 0;
let currentPressedKey = null;
let currentLayout = "qwerty";


document.addEventListener("keydown", (e) => {
  const pressedKey = e.key === " " ? "space" : e.key.toLowerCase();
  const keyDiv = document.querySelector(`.key[data-key="${pressedKey}"]`);
  e.preventDefault();

  if (keyDiv) keyDiv.classList.add("active");

  if (e.key === "Alt" || e.key === "AltRight" || e.key === "AltGraph") return;

  if (!selectedKey) {
    selectedKey = pressedKey;
    selectedKeyElement.textContent = `Tu pètes le : ${selectedKey.toUpperCase()}`;
    return;
  }

  if (pressedKey !== selectedKey) {
    selectedKey = pressedKey;
    selectedKeyElement.textContent = `Tu pètes le : ${selectedKey.toUpperCase()}`;
    pressCount = 0;
    counter.textContent = `Total : 0`;
    frequency.textContent = `Input par seconde : 0`;
    timestamps = [];
    return;
  }

  if (pressedKey !== selectedKey || currentPressedKey === pressedKey) return;

  currentPressedKey = pressedKey;
  pressCount++;
  counter.textContent = `Total : ${pressCount}`;

  const now = Date.now();
  timestamps.push(now);
  if (timestamps.length > maxSamples) timestamps.shift();

  const ips = calculateFrequency(timestamps);
  if (timestamps.length >= 2) frequency.textContent = `Input par seconde : ${ips.toFixed(2)}`;
  if (pressCount >= 10 && ips > maxIPS) {
    maxIPS = ips;
    maxRate.textContent = `IPS max : ${maxIPS.toFixed(2)}`;
  }
});

document.addEventListener("keyup", (e) => {
  const pressedKey = e.key === " " ? "space" : e.key.toLowerCase();
  const keyDiv = document.querySelector(`.key[data-key="${pressedKey}"]`);
  if (keyDiv) keyDiv.classList.remove("active");
  if (pressedKey === currentPressedKey) currentPressedKey = null;
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

// input frequency
function calculateFrequency(timestamps) {
  let delta = 0;
  for (let i = 1; i < timestamps.length; i++) delta += timestamps[i] - timestamps[i - 1];
  const averageDelta = delta / (timestamps.length - 1) / 1000;
  return 1 / averageDelta;
}

function renderKeyboard(layout) {
  keyboardContainer.innerHTML = "";
  layout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    row.split(" ").forEach(token => {
      let keyDef;
      if (specialKeyMap[token.toLowerCase()]) {
        keyDef = specialKeyMap[token.toLowerCase()];
      } else {
        const label = token;
        const code = token.length === 1 && /[a-z]/i.test(label)
          ? `Key${label.toUpperCase()}`
          : /^[0-9]$/.test(label)
          ? `Digit${label}`
          : label;
        keyDef = { code, label };
      }

      const keyDiv = document.createElement("div");
      keyDiv.className = "key";
      keyDiv.dataset.code = keyDef.code;
      keyDiv.dataset.key = keyDef.label === "Space" ? "space" : keyDef.label.toLowerCase();
      keyDiv.textContent = keyDef.label;
      rowDiv.appendChild(keyDiv);
    });

    keyboardContainer.appendChild(rowDiv);
  });
}

layoutToggleButton.addEventListener("click", () => {
  if (currentLayout === "qwerty") {
    renderKeyboard(azertyLayout);
    currentLayout = "azerty";
  } else {
    renderKeyboard(qwertyLayout);
    currentLayout = "qwerty";
  }
});


renderKeyboard(qwertyLayout);
