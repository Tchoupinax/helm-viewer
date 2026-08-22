<template>
  <svg
    :class="markClass"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="32"
      cy="32"
      r="11"
      stroke="currentColor"
      stroke-width="2.4"
    />
    <circle cx="32" cy="32" r="3.2" fill="currentColor" />
    <g
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
    >
      <path
        v-for="(spoke, index) in spokes"
        :key="index"
        :d="spoke"
      />
    </g>
    <circle
      v-for="(knob, index) in knobs"
      :key="`k-${index}`"
      :cx="knob.x"
      :cy="knob.y"
      r="2.4"
      fill="currentColor"
    />
  </svg>
</template>

<script lang="ts">
export default {
  props: {
    markClass: {
      type: String,
      default: "w-7 h-7",
    },
  },
  computed: {
    spokes() {
      return [0, 45, 90, 135].map(deg => {
        const rad = (deg * Math.PI) / 180;
        const inner = 15;
        const outer = 26;
        const x1 = 32 + Math.cos(rad) * inner;
        const y1 = 32 + Math.sin(rad) * inner;
        const x2 = 32 + Math.cos(rad) * outer;
        const y2 = 32 + Math.sin(rad) * outer;
        const x3 = 32 - Math.cos(rad) * inner;
        const y3 = 32 - Math.sin(rad) * inner;
        const x4 = 32 - Math.cos(rad) * outer;
        const y4 = 32 - Math.sin(rad) * outer;
        return `M${x1} ${y1} L${x2} ${y2} M${x3} ${y3} L${x4} ${y4}`;
      });
    },
    knobs() {
      return [0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
        const rad = (deg * Math.PI) / 180;
        return {
          x: 32 + Math.cos(rad) * 26,
          y: 32 + Math.sin(rad) * 26,
        };
      });
    },
  },
};
</script>
