//
https://codesandbox.io/s/github/vuejs/vuejs.org/tree/master/src/v2/examples/vue-20-modal-component?from-embed=&file=/style.css:0-1063
// Add body-scroll-lock-ignore on element you want to continue to scroll (iOS)

<template>
  <div id="modal-template" type="text/x-template">
    <transition name="modal">
      <div class="modal-mask" @click.self="close">
        <div class="modal-wrapper">
          <div class="relative flex flex-col rounded-lg h-1/3 modal-container">
            <button
              class="absolute right-0 mr-6 modal-default-button"
              @click="close"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="4"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div class="flex justify-center h-full overflow-hidden">
              <slot name="body">
                <div class="flex items-center justify-center w-full">
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
    </transition>
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
        allowTouchMove: (el) => {
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
  z-index: 2147483647;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
  @apply flex flex-col justify-center items-center h-screen;
}

.modal-container {
  @apply w-full h-full;
  margin: 40px;
  padding: 20px 30px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-wrapper {
  @apply flex items-center justify-center xl:w-3/4 w-full xl:h-5/6 h-2/3;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
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
  width: 16px;
  background: #000;
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
