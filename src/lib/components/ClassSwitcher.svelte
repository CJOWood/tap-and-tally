<!-- The title opens class tracking. The chevron switches classes. -->
<script lang="ts">
  import { goto } from "$app/navigation";
  import type { Class } from "$lib/domain/types";
  import { store } from "$lib/store.svelte";
  import Icon from "./Icon.svelte";

  let { cls, ontrack }: { cls: Class; ontrack: () => void } = $props();
  let open = $state(false);
</script>

<div class="switcher">
  <h1>
    <button class="title" aria-haspopup="dialog" title="Track points for {cls.name}" onclick={() => {
      open = false;
      ontrack();
    }}>{cls.name}</button>
  </h1>
  {#if store.data.classes.length > 1}
    <button class="chevron" aria-label="Switch class" aria-expanded={open} aria-haspopup="menu" onclick={() => (open = !open)}>
      <Icon name="chevron" size={22} />
    </button>
  {/if}
  {#if open && store.data.classes.length > 1}
    <div class="menu" role="menu">
      {#each store.data.classes as other (other.id)}
        <button
          role="menuitem"
          class:current={other.id === cls.id}
          onclick={() => {
            open = false;
            goto(`/live/${other.id}`);
          }}>{other.name}</button
        >
      {/each}
    </div>
  {/if}
</div>

<svelte:window onclick={(e) => open && !(e.target as HTMLElement).closest(".switcher") && (open = false)} />

<style>
  .switcher {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .title,
  .chevron {
    display: flex;
    align-items: center;
    padding: 0.3rem 0.5rem;
    font: inherit;
    border: 0;
    border-radius: 10px;
    background: none;
    color: var(--text);
  }

  .title:hover,
  .chevron:hover {
    background: var(--surface-sunk);
  }

  .title {
    min-height: 48px;
    padding: 0.5rem 1rem;
    border: 1px solid #d9bfa0;
    border-radius: 12px;
    background: var(--surface);
    box-shadow: 0 6px 16px -10px rgb(90 58 32 / 0.35);
    cursor: pointer;
    transition: transform 0.08s;
  }

  .title:active {
    transform: scale(0.97);
  }

  .title:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.4rem, 2.6vw, 2rem);
  }

  .menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    display: grid;
    min-width: 240px;
    padding: 0.35rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    box-shadow: var(--shadow);
  }

  .menu button {
    padding: 0.7rem 0.85rem;
    border: 0;
    border-radius: 8px;
    background: none;
    font-weight: 700;
    text-align: left;
  }

  .menu button:hover,
  .menu .current {
    background: var(--accent-wash);
    color: var(--accent-deep);
  }
</style>
