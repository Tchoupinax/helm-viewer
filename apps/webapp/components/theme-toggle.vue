<template>
  <button
    class="rounded-md p-1.5 text-foam ring-1 ring-line transition-colors hover:bg-dock"
    type="button"
    :title="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="onToggle"
  >
    <svg
      v-if="theme === 'dark'"
      class="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        stroke-linecap="round"
        d="M12 3v1.5M12 19.5V21M4.2 4.2l1.1 1.1M18.7 18.7l1.1 1.1M3 12h1.5M19.5 12H21M4.2 19.8l1.1-1.1M18.7 5.3l1.1-1.1"
      />
    </svg>
    <svg
      v-else
      class="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M16.5 13.2A6.2 6.2 0 0 1 10.8 7.5 5.4 5.4 0 1 0 16.5 13.2Z"
      />
    </svg>
  </button>
</template>

<script lang="ts">
import { getTheme, type Theme,THEME_EVENT, toggleTheme } from "../functions/theme";

export default {
  data(): { theme: Theme } {
    return {
      theme: "light",
    };
  },
  mounted() {
    this.theme = getTheme();
    window.addEventListener(THEME_EVENT, this.onThemeChange);
  },
  beforeUnmount() {
    window.removeEventListener(THEME_EVENT, this.onThemeChange);
  },
  methods: {
    onToggle() {
      this.theme = toggleTheme();
    },
    onThemeChange(event: Event) {
      this.theme = (event as CustomEvent<Theme>).detail;
    },
  },
};
</script>
