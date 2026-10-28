<script lang="ts">
  import status from '#lib/data/incident-4471-status.json';
</script>

<p>
  Source desk: <strong>#{status.ticket} {status.status}</strong> on
  <time datetime={status.closedOn}>{status.closedOn}</time>.
  <a href={status.source}>Engineering update on the challenge page</a>.
</p>

<table>
  <thead><tr><th>cause</th><th>desk outcome</th><th>engineering update</th><th>follow-up ticket</th></tr></thead>
  <tbody>
    {#each status.updates as update (update.cause)}
      <tr>
        <td><code>{update.cause}</code></td>
        <td>{update.outcome}</td>
        <td>{update.detail}</td>
        <td><a href={update.followup}>{update.cause} follow-up</a></td>
      </tr>
    {/each}
  </tbody>
</table>
