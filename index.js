const counter = document.querySelector("#counter");
const frequency = document.querySelector("#rate");
const maxRate = document.querySelector("#max-rate");
const selectedKeyElement = document.querySelector("#selected-key");
const resetButton = document.querySelector("#reset");

const maxSamples = 10;
let timestamps = [];
let maxIPS = 0;
let selectedKey = null;
let pressCount = 0;
let currentPressedKey = null;

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
    maxRate.textContent = `IPS max : 0`;
    timestamps = [];
    maxIPS = 0;
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
