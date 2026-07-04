(function () {
  const API_BASE = "https://app.eagleaviationhq.com/api/booking";
  const TIMEZONE = "America/Chicago";
  const BOOKING_END = new Date("2027-12-31T23:59:59Z");

  const monthLabel = document.getElementById("book-month-label");
  const calendarGrid = document.getElementById("book-calendar-grid");
  const prevMonthBtn = document.getElementById("book-prev-month");
  const nextMonthBtn = document.getElementById("book-next-month");
  const slotsPanel = document.getElementById("book-slots-panel");
  const slotsTitle = document.getElementById("book-slots-title");
  const slotsMeta = document.getElementById("book-slots-meta");
  const slotsList = document.getElementById("book-slots-list");
  const statusEl = document.getElementById("book-status");
  const selectedPanel = document.getElementById("book-selected");
  const selectedSummary = document.getElementById("book-selected-summary");
  const reserveForm = document.getElementById("book-reserve-form");
  const reserveBtn = document.getElementById("book-reserve-btn");
  const confirmedPanel = document.getElementById("book-confirmed");
  const confirmedSummary = document.getElementById("book-confirmed-summary");

  if (!calendarGrid) return;

  let viewYear;
  let viewMonth;
  let selectedDate = null;
  let selectedSlot = null;
  let availabilityByDate = new Map();

  function todayParts() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(new Date());
    const get = (type) => Number(parts.find((part) => part.type === type)?.value ?? "0");
    return { year: get("year"), month: get("month"), day: get("day") };
  }

  function formatMonthLabel(year, month) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      month: "long",
      year: "numeric",
    }).format(new Date(Date.UTC(year, month - 1, 1, 12)));
  }

  function toDateKey(year, month, day) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function firstWeekday(year, month) {
    return new Date(year, month - 1, 1).getDay();
  }

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message || "";
  }

  function formatSlotTime(iso) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  }

  function formatSlotButton(iso) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  }

  async function loadAvailability(year, month) {
    const from = toDateKey(year, month, 1);
    const to = toDateKey(year, month, daysInMonth(year, month));
    setStatus("Loading open days…");

    try {
      const res = await fetch(`${API_BASE}/availability?from=${from}&to=${to}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load availability");

      availabilityByDate = new Map(
        (data.dates || []).map((row) => [row.date, row.slotCount]),
      );
      setStatus("");
      renderCalendar();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not load availability.");
      availabilityByDate = new Map();
      renderCalendar();
    }
  }

  function renderCalendar() {
    calendarGrid.innerHTML = "";
    monthLabel.textContent = formatMonthLabel(viewYear, viewMonth);

    const leading = firstWeekday(viewYear, viewMonth);
    const totalDays = daysInMonth(viewYear, viewMonth);
    const today = todayParts();

    for (let i = 0; i < leading; i += 1) {
      const spacer = document.createElement("div");
      spacer.className = "book-calendar__day book-calendar__day--muted";
      spacer.setAttribute("aria-hidden", "true");
      calendarGrid.appendChild(spacer);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const dateKey = toDateKey(viewYear, viewMonth, day);
      const slotCount = availabilityByDate.get(dateKey) ?? 0;
      const dateObj = new Date(`${dateKey}T12:00:00`);
      const isPast =
        viewYear < today.year ||
        (viewYear === today.year && viewMonth < today.month) ||
        (viewYear === today.year && viewMonth === today.month && day < today.day);
      const isBeyondWindow = dateObj > BOOKING_END;
      const disabled = isPast || isBeyondWindow || slotCount === 0;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "book-calendar__day";
      if (disabled) button.classList.add("book-calendar__day--disabled");
      if (selectedDate === dateKey) button.classList.add("book-calendar__day--selected");
      if (
        viewYear === today.year &&
        viewMonth === today.month &&
        day === today.day
      ) {
        button.classList.add("book-calendar__day--today");
      }

      button.innerHTML = `<span class="book-calendar__day-num">${day}</span>`;
      if (slotCount > 0 && !disabled) {
        const dot = document.createElement("span");
        dot.className = "book-calendar__dot";
        dot.setAttribute("aria-hidden", "true");
        button.appendChild(dot);
      }

      button.disabled = disabled;
      button.setAttribute("aria-label", `${dateKey}, ${slotCount} open slots`);
      button.addEventListener("click", () => {
        selectedDate = dateKey;
        selectedSlot = null;
        selectedPanel.hidden = true;
        confirmedPanel.hidden = true;
        renderCalendar();
        void loadSlots(dateKey);
      });

      calendarGrid.appendChild(button);
    }
  }

  async function loadSlots(dateKey) {
    slotsPanel.hidden = false;
    slotsList.innerHTML = "";
    slotsTitle.textContent = "Available times";
    slotsMeta.textContent = "Loading open slots…";
    setStatus("");

    try {
      const res = await fetch(`${API_BASE}/slots?date=${dateKey}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load slots");

      const slots = data.slots || [];
      slotsMeta.textContent =
        slots.length > 0
          ? `${slots.length} open ${slots.length === 1 ? "slot" : "slots"} · 7am–9pm Central`
          : "No open slots on this day.";

      if (slots.length === 0) {
        setStatus("Try another day — this one is fully booked or unavailable.");
        return;
      }

      slots.forEach((slot) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "book-slot-btn";
        button.textContent = `${formatSlotButton(slot.start)} · ${slot.aircraftName}`;
        button.addEventListener("click", () => {
          selectedSlot = slot;
          selectedPanel.hidden = false;
          confirmedPanel.hidden = true;
          selectedSummary.textContent = `${formatSlotTime(slot.start)} · ${slot.aircraftName} (${slot.aircraftType || "Aircraft"}) · ${slot.durationMinutes} min discovery flight · $195`;
          setStatus("Enter your info below to reserve this time.");
          selectedPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        slotsList.appendChild(button);
      });
    } catch (err) {
      slotsMeta.textContent = "";
      setStatus(err instanceof Error ? err.message : "Could not load slots.");
    }
  }

  function showBookingConfirmed(summaryText) {
    selectedPanel.hidden = true;
    slotsPanel.hidden = true;
    confirmedPanel.hidden = false;
    confirmedSummary.textContent = summaryText;
    setStatus("");
    confirmedPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    selectedSlot = null;
    selectedDate = null;
    void loadAvailability(viewYear, viewMonth);
  }

  async function confirmPaidBooking(sessionId) {
    setStatus("Confirming your payment and booking…");
    const res = await fetch(`${API_BASE}/confirm?session_id=${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not confirm your booking");
    const start = data.start ? formatSlotTime(data.start) : "your selected time";
    const aircraftName = data.aircraftName || "N5984G";
    showBookingConfirmed(`${start} · ${aircraftName} · $195 discovery flight paid`);
    window.history.replaceState({}, "", "/book");
  }

  reserveForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!selectedSlot) {
      setStatus("Pick a time before checking out.");
      return;
    }

    const formData = new FormData(reserveForm);
    const payload = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      aircraftId: selectedSlot.aircraftId,
      start: selectedSlot.start,
      end: selectedSlot.end,
    };

    reserveBtn.disabled = true;
    reserveBtn.textContent = "Reserving…";
    setStatus("");

    try {
      const res = await fetch(`${API_BASE}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reserve booking");
      const start = data.start ? formatSlotTime(data.start) : "your selected time";
      const aircraftName = data.aircraftName || selectedSlot.aircraftName || "N5984G";
      showBookingConfirmed(`${start} · ${aircraftName} · $195 discovery flight reserved`);
      reserveForm.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not reserve booking.";
      setStatus(message);
      if (message.includes("just booked") && selectedDate) {
        void loadSlots(selectedDate);
      }
      reserveBtn.disabled = false;
      reserveBtn.textContent = "Reserve this time";
    }
  });

  prevMonthBtn?.addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 1) {
      viewMonth = 12;
      viewYear -= 1;
    }
    void loadAvailability(viewYear, viewMonth);
  });

  nextMonthBtn?.addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 12) {
      viewMonth = 1;
      viewYear += 1;
    }
    void loadAvailability(viewYear, viewMonth);
  });

  const start = todayParts();
  viewYear = start.year;
  viewMonth = start.month;

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const canceled = params.get("canceled");

  if (sessionId) {
    void confirmPaidBooking(sessionId).catch((err) => {
      setStatus(err instanceof Error ? err.message : "Could not confirm your booking.");
    });
  } else if (canceled) {
    setStatus("Checkout canceled — your time was not booked. Pick another slot anytime.");
    window.history.replaceState({}, "", "/book");
  }

  void loadAvailability(viewYear, viewMonth);
})();