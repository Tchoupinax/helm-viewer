<template>
  <div id="modal-template">
    <div class="modal-mask" @click.self="close">
      <div class="modal-panel">
        <button
          class="absolute right-4 top-4 rounded-md p-1 text-mist transition-colors hover:bg-dock hover:text-foam"
          type="button"
          @click="close"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div class="flex h-full min-h-0 justify-center overflow-hidden">
          <slot name="body">
            <div class="flex w-full items-center justify-center">
              <div class="lds-facebook">
                <div />
                <div />
                <div />
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as bodyScrollLock from "body-scroll-lock";
const disableBodyScroll = bodyScrollLock.disableBodyScroll;
const enableBodyScroll = bodyScrollLock.enableBodyScroll;

export default {
  emits: ["close"],
  mounted() {
    setTimeout(() => {
      disableBodyScroll(document.querySelector("#modal-template"), {
        allowTouchMove: el => {
          while (el && el !== document.body) {
            if (el.getAttribute("body-scroll-lock-ignore") !== null) {
              return true;
            }

            el = el.parentElement;
          }
        },
      });
    }, 1);
  },
  methods: {
    close() {
      enableBodyScroll(document.querySelector("#modal-template"));
      this.$emit("close");
    },
  },
};
</script>

<style>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay);
  padding: 24px;
}

.modal-panel {
  position: relative;
  display: flex;
  width: min(640px, 100%);
  min-height: 280px;
  max-height: min(80vh, 520px);
  flex-direction: column;
  border-radius: 16px;
  background: var(--harbor);
  color: var(--foam);
  box-shadow: 0 24px 80px var(--notify-shadow);
  border: 1px solid var(--line);
}

.lds-facebook {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.lds-facebook div {
  display: inline-block;
  position: absolute;
  left: 8px;
  width: 12px;
  background: var(--signal);
  animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}

.lds-facebook div:nth-child(1) {
  left: 8px;
  animation-delay: -0.24s;
}

.lds-facebook div:nth-child(2) {
  left: 32px;
  animation-delay: -0.12s;
}

.lds-facebook div:nth-child(3) {
  left: 56px;
  animation-delay: 0;
}

@keyframes lds-facebook {
  0% {
    top: 8px;
    height: 64px;
  }
  50%,
  100% {
    top: 24px;
    height: 32px;
  }
}
</style>
