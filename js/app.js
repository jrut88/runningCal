(() => {
  "use strict";

  const KM_PER_MI = 1.60934;
  const STORAGE_KEY = "splitcard.v1";
  const PACES_KEY = "splitcard.savedPaces.v1";
  const MAX_SAVED_PACES = 6;

  const els = {
    tabs: Array.from(document.querySelectorAll(".tab")),
    fields: {
      time: document.querySelector('[data-field="time"]'),
      pace: document.querySelector('[data-field="pace"]'),
      distance: document.querySelector('[data-field="distance"]'),
    },
    timeInput: document.getElementById("time-input"),
    paceInput: document.getElementById("pace-input"),
    distanceInput: document.getElementById("distance-input"),
    paceUnitToggle: document.querySelector('[data-toggle-target="pace-unit"]'),
    distanceUnitToggle: document.querySelector('[data-toggle-target="distance-unit"]'),
    resultLabel: document.getElementById("result-label"),
    resultValue: document.getElementById("result-value"),
    resultSub: document.getElementById("result-sub"),
    paceChipRow: document.getElementById("pace-chip-row"),
    paceChips: document.getElementById("pace-chips"),
    savePaceBtn: document.getElementById("save-pace-btn"),
  };

  const MODES = {
    distance: { hide: "distance", label: "Estimated distance" },
    pace: { hide: "pace", label: "Estimated pace" },
    time: { hide: "time", label: "Estimated time" },
  };

  let state = {
    mode: "distance",
    paceUnit: "km",
    distanceUnit: "km",
  };

  loadState();

  let savedPaces = loadSavedPaces();

  // ---------- parsing & formatting ----------

  function parsePace(raw) {
    if (!raw) return null;
    const str = raw.trim();
    if (!str) return null;
    if (str.includes(":")) {
      const [mmStr, ssStr] = str.split(":");
      const mm = parseInt(mmStr, 10);
      const ss = parseInt(ssStr, 10);
      if (!Number.isFinite(mm) || !Number.isFinite(ss) || ss < 0 || ss >= 60) return null;
      const total = mm + ss / 60;
      return total > 0 ? total : null;
    }
    const val = parseFloat(str);
    return Number.isFinite(val) && val > 0 ? val : null;
  }

  function formatPace(minutesPerUnit) {
    if (!Number.isFinite(minutesPerUnit) || minutesPerUnit <= 0) return null;
    let mm = Math.floor(minutesPerUnit);
    let ss = Math.round((minutesPerUnit - mm) * 60);
    if (ss === 60) {
      mm += 1;
      ss = 0;
    }
    return `${mm}:${String(ss).padStart(2, "0")}`;
  }

  function formatTime(minutesFloat) {
    if (!Number.isFinite(minutesFloat) || minutesFloat <= 0) return null;
    const totalSeconds = Math.round(minutesFloat * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function formatDistance(value) {
    if (!Number.isFinite(value)) return null;
    return (Math.round(value * 100) / 100).toString();
  }

  function convertDistance(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    return fromUnit === "km" ? value / KM_PER_MI : value * KM_PER_MI;
  }

  function otherUnit(unit) {
    return unit === "km" ? "mi" : "km";
  }

  // ---------- persistence ----------

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        state = { ...state, ...parsed };
      }
    } catch (e) {
      /* ignore corrupt storage */
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable */
    }
  }

  function loadSavedPaces() {
    try {
      const raw = localStorage.getItem(PACES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveSavedPaces() {
    try {
      localStorage.setItem(PACES_KEY, JSON.stringify(savedPaces));
    } catch (e) {
      /* storage unavailable */
    }
  }

  // ---------- rendering ----------

  function applyMode() {
    const cfg = MODES[state.mode];
    for (const [name, el] of Object.entries(els.fields)) {
      el.hidden = name === cfg.hide;
    }
    els.resultLabel.textContent = cfg.label;
    els.tabs.forEach((tab) => {
      const active = tab.dataset.mode === state.mode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    els.paceChipRow.hidden = cfg.hide === "pace";
  }

  function applyUnitToggles() {
    setToggleActive(els.paceUnitToggle, state.paceUnit);
    setToggleActive(els.distanceUnitToggle, state.distanceUnit);
  }

  function setToggleActive(toggleEl, value) {
    toggleEl.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === value);
    });
  }

  function renderChips() {
    els.paceChips.innerHTML = "";
    savedPaces.forEach((chip, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.innerHTML = `<span>${chip.value}/${chip.unit}</span><span class="remove" aria-label="Remove saved pace">✕</span>`;
      btn.addEventListener("click", (evt) => {
        if (evt.target.closest(".remove")) {
          savedPaces.splice(index, 1);
          saveSavedPaces();
          renderChips();
          return;
        }
        els.paceInput.value = chip.value;
        state.paceUnit = chip.unit;
        applyUnitToggles();
        saveState();
        compute();
      });
      els.paceChips.appendChild(btn);
    });
  }

  function updateSaveButtonVisibility() {
    const cfg = MODES[state.mode];
    const paceVisible = cfg.hide !== "pace";
    const parsed = parsePace(els.paceInput.value);
    els.savePaceBtn.hidden = !(paceVisible && parsed);
  }

  function showEmptyResult(message) {
    els.resultValue.textContent = message || "—";
    els.resultValue.classList.add("is-empty");
    els.resultSub.textContent = " ";
  }

  function showResult(value, sub) {
    els.resultValue.textContent = value;
    els.resultValue.classList.remove("is-empty");
    els.resultSub.textContent = sub || " ";
  }

  // ---------- computation ----------

  function compute() {
    updateSaveButtonVisibility();

    if (state.mode === "distance") {
      const time = parseFloat(els.timeInput.value);
      const pace = parsePace(els.paceInput.value);
      if (!(time > 0) || !pace) return showEmptyResult();
      const dist = time / pace;
      const other = convertDistance(dist, state.paceUnit, otherUnit(state.paceUnit));
      showResult(
        `${formatDistance(dist)} ${state.paceUnit}`,
        `≈ ${formatDistance(other)} ${otherUnit(state.paceUnit)}`
      );
      return;
    }

    if (state.mode === "pace") {
      const time = parseFloat(els.timeInput.value);
      const distance = parseFloat(els.distanceInput.value);
      if (!(time > 0) || !(distance > 0)) return showEmptyResult();
      const pace = time / distance;
      const paceStr = formatPace(pace);
      const otherPace =
        state.distanceUnit === "km" ? pace * KM_PER_MI : pace / KM_PER_MI;
      showResult(
        `${paceStr} /${state.distanceUnit}`,
        `≈ ${formatPace(otherPace)} /${otherUnit(state.distanceUnit)}`
      );
      return;
    }

    // mode === "time"
    const distance = parseFloat(els.distanceInput.value);
    const pace = parsePace(els.paceInput.value);
    if (!(distance > 0) || !pace) return showEmptyResult();
    const distInPaceUnit = convertDistance(distance, state.distanceUnit, state.paceUnit);
    const minutes = distInPaceUnit * pace;
    const timeStr = formatTime(minutes);
    showResult(timeStr, `≈ ${Math.round(minutes * 10) / 10} min total`);
  }

  // ---------- events ----------

  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.mode = tab.dataset.mode;
      applyMode();
      saveState();
      compute();
    });
  });

  [els.timeInput, els.paceInput, els.distanceInput].forEach((input) => {
    input.addEventListener("input", compute);
  });

  els.paceUnitToggle.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.paceUnit = btn.dataset.value;
      applyUnitToggles();
      saveState();
      compute();
    });
  });

  els.distanceUnitToggle.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.distanceUnit = btn.dataset.value;
      applyUnitToggles();
      saveState();
      compute();
    });
  });

  els.savePaceBtn.addEventListener("click", () => {
    const parsed = parsePace(els.paceInput.value);
    if (!parsed) return;
    const value = formatPace(parsed);
    const unit = state.paceUnit;
    const exists = savedPaces.some((p) => p.value === value && p.unit === unit);
    if (!exists) {
      savedPaces.unshift({ value, unit });
      savedPaces = savedPaces.slice(0, MAX_SAVED_PACES);
      saveSavedPaces();
      renderChips();
    }
  });

  // ---------- init ----------

  applyMode();
  applyUnitToggles();
  renderChips();
  compute();
})();
