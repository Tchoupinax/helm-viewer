<template>
  <div class="error-mask" @click.self="$emit('close')">
    <div class="error-panel">
      <div class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <p class="font-display text-xl text-coral">Helm error</p>
          <p class="mt-0.5 text-[12px] text-mist">
            The chart failed to render. Fix the template and save to retry.
          </p>
        </div>
        <button
          class="rounded-md px-2 py-1 text-[12px] text-mist ring-1 ring-line hover:bg-dock hover:text-foam"
          type="button"
          @click="$emit('close')"
        >
          Dismiss
        </button>
      </div>
      <pre class="error-body">{{ error }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: String,
      default: "",
    },
  },
  emits: ["close"],
};
</script>

<style scoped>
.error-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay);
  padding: 24px;
}

.error-panel {
  display: flex;
  width: min(860px, 100%);
  max-height: min(80vh, 640px);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--harbor);
  box-shadow: 0 24px 80px var(--notify-shadow);
}

.error-body {
  margin: 0;
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 20px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--coral);
  white-space: pre-wrap;
}
</style>
