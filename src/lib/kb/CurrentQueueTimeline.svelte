<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import QueueTimeline from '#lib/kb/QueueTimeline.svelte';

  let { ticket }: { ticket: number } = $props();
  const DAY = 86_400_000;
  const bounds = $derived.by(() => {
    const dates = uniqueById(reports as Report[])
      .filter(r => r.mergedInto === ticket)
      .flatMap(r => [r.receivedAt, ...(r.mergedAt ? [r.mergedAt] : [])])
      .map(d => Date.parse(d.slice(0, 10)))
      .filter(Number.isFinite);
    if (!dates.length) return null;
    const first = Math.min(...dates);
    const last = Math.max(...dates);
    const monday = (day: number) => day - ((new Date(day).getUTCDay() + 6) % 7) * DAY;
    const iso = (day: number) => new Date(day).toISOString().slice(0, 10);
    return { from: iso(monday(first)), to: iso(monday(last) + 7 * DAY) };
  });
</script>

{#if bounds}
  <QueueTimeline {ticket} from={bounds.from} to={bounds.to} />
{:else}
  <p>No reports are currently merged into #{ticket}.</p>
{/if}
