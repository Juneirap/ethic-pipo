{#if show}
  <div
    class="toast toast-end"
    class:toast-success={type === 'success'}
    class:toast-error={type === 'error'}
    class:toast-info={type === 'info'}
    class:toast-warning={type === 'warning'}
    transition:fade
  >
    <div class="alert" role="alert">
      <span>{message}</span>
    </div>
  </div>
{/if}

<script>
  import { fade } from 'svelte/transition';
  import { toastStore } from '$lib/stores/toast';

  let show = false;
  let message = '';
  let type = 'info';
  let timeoutId;

  toastStore.subscribe(({ show: s, message: m, type: t }) => {
    if (timeoutId) clearTimeout(timeoutId);
    
    show = s;
    message = m;
    type = t;

    if (show) {
      timeoutId = setTimeout(() => {
        show = false;
      }, 3000);
    }
  });
</script>

<style>
  .toast {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 1000;
  }

  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    color: white;
  }

  .toast-success .alert {
    background-color: #48bb78;
  }

  .toast-error .alert {
    background-color: #f56565;
  }

  .toast-info .alert {
    background-color: #4299e1;
  }

  .toast-warning .alert {
    background-color: #ed8936;
  }
</style>
