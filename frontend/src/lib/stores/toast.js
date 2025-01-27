import { writable } from 'svelte/store';

const defaultState = {
  show: false,
  message: '',
  type: 'info' // 'success' | 'error' | 'info' | 'warning'
};

function createToastStore() {
  const { subscribe, set } = writable(defaultState);

  return {
    subscribe,
    show: (message, type = 'info') => {
      set({ show: true, message, type });
    },
    hide: () => {
      set(defaultState);
    }
  };
}

export const toastStore = createToastStore();
