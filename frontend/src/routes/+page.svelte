<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  onMount(() => {
    goto("/home");
  });
</script>

<div class="loading">
  <img src="/path/to/loading-image.gif" alt="Loading..." />
</div>

<style>
  .loading {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
