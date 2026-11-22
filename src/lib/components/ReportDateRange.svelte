<script lang="ts">
  import { tick } from "svelte";
  import { dayKey, type CalendarRange } from "$lib/domain/days";

  let {
    applied,
    onselect,
  }: {
    applied: CalendarRange | null;
    onselect: (range: CalendarRange) => void;
  } = $props();

  const id = $props.id();
  const months = Array.from({ length: 12 }, (_, month) =>
    new Date(2024, month, 1).toLocaleDateString(undefined, { month: "long" }),
  );
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let popup: HTMLElement;
  let trigger: HTMLButtonElement;
  let draft = $state("");
  let focused = $state(new Date());
  const year = $derived(focused.getFullYear());
  const month = $derived(focused.getMonth());
  const first = $derived(calendarDate(year, month, 1));
  const offset = $derived((first.getDay() + 6) % 7);
  const days = $derived(
    Array.from(
      { length: calendarDate(year, month + 1, 0).getDate() },
      (_, index) => calendarDate(year, month, index + 1),
    ),
  );

  function calendarDate(year: number, month: number, day: number) {
    const date = new Date(2000, 0, 1, 12);
    date.setFullYear(year, month, day);
    return date;
  }

  async function focusDay(date: Date) {
    if (date.getFullYear() < 1 || date.getFullYear() > 9999) return;
    focused = date;
    await tick();
    popup.querySelector<HTMLButtonElement>('[data-day][tabindex="0"]')?.focus();
  }

  function onToggle(event: ToggleEvent) {
    if (event.newState !== "open") return;
    draft = "";
    void focusDay(applied ? new Date(applied.start + "T12:00:00") : new Date());
  }

  function closeCalendar() {
    popup.hidePopover();
    trigger.focus();
  }

  function pick(date: Date) {
    const key = dayKey(date);
    focused = date;
    if (!draft) {
      draft = key;
      return;
    }
    const [start, end] = [draft, key].sort();
    onselect({ start, end });
    closeCalendar();
  }

  function changeMonth(targetYear: number, targetMonth: number) {
    const last = calendarDate(targetYear, targetMonth + 1, 0).getDate();
    return calendarDate(
      targetYear,
      targetMonth,
      Math.min(focused.getDate(), last),
    );
  }

  function navigate(event: KeyboardEvent, date: Date) {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -((date.getDay() + 6) % 7),
      End: 6 - ((date.getDay() + 6) % 7),
    };
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const step = event.key === "PageUp" ? -1 : 1;
      void focusDay(
        changeMonth(year, month + step * (event.shiftKey ? 12 : 1)),
      );
    } else if (Object.hasOwn(offsets, event.key)) {
      event.preventDefault();
      void focusDay(
        calendarDate(year, month, date.getDate() + offsets[event.key]),
      );
    }
  }
</script>

<div class="custom-range">
  <button
    class="btn"
    class:active={applied}
    type="button"
    bind:this={trigger}
    popovertarget={id}
  >
    {applied ? `${applied.start} to ${applied.end}` : "Custom"}
  </button>

  <div
    class="card calendar"
    {id}
    popover="auto"
    role="dialog"
    aria-label="Custom date range"
    bind:this={popup}
    ontoggle={onToggle}
  >
    <div class="row calendar-header">
      <button
        type="button"
        aria-label="Previous month"
        disabled={year === 1 && month === 0}
        onclick={() => (focused = changeMonth(year, month - 1))}>‹</button
      >
      <select
        aria-label="Month"
        value={month}
        onchange={(event) =>
          (focused = changeMonth(year, Number(event.currentTarget.value)))}
      >
        {#each months as label, index}<option value={index}>{label}</option
          >{/each}
      </select>
      <input
        aria-label="Year"
        type="number"
        min="1"
        max="9999"
        value={year}
        onchange={(event) => {
          const input = event.currentTarget;
          if (input.value && input.validity.valid)
            focused = changeMonth(input.valueAsNumber, month);
          else input.value = String(year);
        }}
      />
      <button
        type="button"
        aria-label="Next month"
        disabled={year === 9999 && month === 11}
        onclick={() => (focused = changeMonth(year, month + 1))}>›</button
      >
      <button type="button" aria-label="Close calendar" onclick={closeCalendar}
        >×</button
      >
    </div>

    <p class="small muted" aria-live="polite">
      {draft ? "Choose the other date." : "Choose the first date."}
    </p>
    <div class="days" role="group" aria-label={months[month] + " " + year}>
      {#each weekdays as day}<span class="small muted" aria-hidden="true"
          >{day}</span
        >{/each}
      {#each days as date (dayKey(date))}
        {@const key = dayKey(date)}
        <button
          type="button"
          data-day
          tabindex={key === dayKey(focused) ? 0 : -1}
          style:grid-column-start={date.getDate() === 1
            ? offset + 1
            : undefined}
          aria-label={date.toLocaleDateString(undefined, { dateStyle: "full" })}
          aria-pressed={draft
            ? key === draft
            : !!applied && key >= applied.start && key <= applied.end}
          onclick={() => pick(date)}
          onkeydown={(event) => navigate(event, date)}
        >
          {date.getDate()}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .custom-range {
    align-self: end;
  }

  .active {
    background: var(--accent);
    color: #fffaf0;
  }

  .calendar {
    width: min(22rem, calc(100vw - 1rem));
    max-height: calc(100dvh - 1rem);
    overflow: auto;
    color: inherit;
  }

  .calendar-header {
    flex-wrap: nowrap;
    gap: 0.3rem;
  }

  .calendar-header select {
    min-width: 0;
    flex: 1;
  }

  .calendar-header input {
    width: 5rem;
  }

  .days {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.15rem;
    text-align: center;
  }

  .days button,
  .calendar-header button {
    min-height: 2rem;
    padding: 0.15rem;
    border: 1px solid var(--border);
    border-radius: 0.35rem;
    background: var(--surface);
  }

  .days button[aria-pressed="true"] {
    background: var(--accent);
    color: #fffaf0;
  }
</style>
