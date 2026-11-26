<script lang="ts">
  import { untrack } from "svelte";
  import { dayKey } from "$lib/domain/days";
  import { fullName, orderStudents } from "$lib/domain/students";
  import { isAbsent } from "$lib/domain/taps";
  import type { Behavior, Class, Id, Menu } from "$lib/domain/types";
  import { store } from "$lib/store.svelte";
  import { liveTracker } from "$lib/tracker.svelte";
  import TapBox from "./TapBox.svelte";

  let { cls, menu, onclose }: { cls: Class; menu: Menu | undefined; onclose: () => void } = $props();

  const today = dayKey();
  const students = $derived(orderStudents(cls.students.filter((student) => !student.former), "first-asc"));
  const absent = (id: Id) => isAbsent(store.data.absences, id, today);
  let checked = $state<Id[]>(untrack(() => students.filter((student) => !absent(student.id)).map((student) => student.id)));
  let undo = $state<(() => void) | null>(null);
  let status = $state("");

  function award(behavior: Behavior) {
    const result = store.awardClass(cls.id, checked, behavior.id);
    if (!result) {
      status = "Everyone selected already has this mark today.";
      return;
    }

    undo = result.undo;
    status = `${behavior.name} awarded to ${result.count} ${result.count === 1 ? "student" : "students"}.`;
  }
</script>

{#snippet controls()}
  <div class="feedback">
    <span role="status">{status}</span>
    {#if undo}
      <button class="btn btn-quiet" onclick={() => {
        undo?.();
        undo = null;
        status = "Last award undone.";
      }}>Undo</button>
    {/if}
  </div>
  <fieldset>
    <legend>Students ({checked.length} selected)</legend>
    <div class="roster">
      {#each students as student (student.id)}
        <label>
          <input type="checkbox" value={student.id} bind:group={checked} />
          <span>{fullName(student)}{#if absent(student.id)} <small>(absent)</small>{/if}</span>
        </label>
      {:else}
        <span class="muted">No students in this class.</span>
      {/each}
    </div>
  </fieldset>
{/snippet}

<TapBox
  {menu}
  {onclose}
  tracker={liveTracker}
  todayTaps={[]}
  classAward={{ title: cls.name, disabled: checked.length === 0, award, controls }}
/>

<style>
  .feedback {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  fieldset {
    min-width: 0;
    margin: 1rem 0 0;
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .roster {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
    gap: 0.25rem 0.75rem;
  }

  label {
    display: flex;
    align-items: center;
    min-height: 44px;
    gap: 0.5rem;
  }

  input {
    width: 1.25rem;
    height: 1.25rem;
    flex: none;
  }
</style>
