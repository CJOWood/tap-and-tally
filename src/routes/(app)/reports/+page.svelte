<!-- One table per Class and date range: students down the side, Behaviors across the top. -->
<script lang="ts">
  import { page } from "$app/state";
  import { replaceState } from "$app/navigation";
  import { RANGES, dayKey, rangeStart, readCalendarRange, type CalendarRange, type Range } from "$lib/domain/days";
  import { buildReport, reportCsv } from "$lib/domain/reports";
  import ReportDateRange from "$lib/components/ReportDateRange.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { store } from "$lib/store.svelte";

  let classId = $state(store.data.classes[0]?.id ?? "");
  let range = $state<Range>("week");
  const cls = $derived(store.findClass(classId));
  const custom = $derived(readCalendarRange(page.url.searchParams));
  const report = $derived(cls ? buildReport(cls, store.data, custom ?? rangeStart(range)) : null);

  function setCustom(selection: CalendarRange | null) {
    const url = new URL(page.url);
    if (selection) {
      url.searchParams.set("start", selection.start);
      url.searchParams.set("end", selection.end);
    } else {
      url.searchParams.delete("start");
      url.searchParams.delete("end");
    }
    replaceState(url, page.state);
  }

  function selectPreset(value: Range) {
    range = value;
    setCustom(null);
  }

  function download() {
    if (!cls || !report) return;
    const file = new Blob([reportCsv(report)], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    const period = custom ? `${custom.start} to ${custom.end}` : RANGES.find((r) => r.value === range)?.label;
    link.download = `${cls.name} - ${period} - ${dayKey()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
</script>

<svelte:head><title>Reports · Tap & Tally</title></svelte:head>

<div class="page stack">
  <h1>Reports</h1>

  {#if store.data.classes.length === 0}
    <p class="card muted">Set up a class to see reports.</p>
  {:else}
    <div class="row">
      <label class="grow">
        Class
        <select bind:value={classId}>
          {#each store.data.classes as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
        </select>
      </label>
      <div class="ranges" role="radiogroup" aria-label="Date range">
        {#each RANGES as r}
          <button role="radio" aria-checked={!custom && range === r.value} class:on={!custom && range === r.value} onclick={() => selectPreset(r.value)}>{r.label}</button>
        {/each}
      </div>
      <ReportDateRange applied={custom} onselect={setCustom} />
    </div>

    {#if report}
      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              {#each report.columns as column (column.behavior.id)}
                <th class="num">{column.behavior.emoji} {column.label}</th>
              {/each}
              <th class="num">Days absent</th>
            </tr>
          </thead>
          <tbody>
            {#each report.rows as row}
              <tr class:left={row.left}>
                <td>{row.name}{#if row.left} <span class="muted small">(left)</span>{/if}</td>
                {#each row.counts as n}<td class="num" class:zero={n === 0}>{n}</td>{/each}
                <td class="num" class:zero={row.absent === 0}>{row.absent}</td>
              </tr>
            {:else}
              <tr><td colspan={report.columns.length + 2} class="muted">No students in this class.</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="row">
        <span class="spacer"></span>
        <button class="btn btn-primary" onclick={download}><Icon name="download" size={16} /> Download spreadsheet</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .grow {
    flex: 1;
    min-width: 200px;
  }

  .ranges {
    display: flex;
    align-self: end;
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    overflow: hidden;
  }

  .ranges button {
    min-height: 40px;
    padding: 0.3rem 0.9rem;
    border: 0;
    background: var(--surface);
    font-weight: 600;
  }

  .ranges button + button {
    border-left: 1px solid var(--border-strong);
  }

  .ranges button.on {
    background: var(--accent);
    color: #fffaf0;
  }

  .table-wrap {
    overflow-x: auto;
    padding: 0.5rem 1rem;
  }

  .zero {
    color: var(--border);
  }

  .left td {
    color: var(--muted);
  }
</style>
